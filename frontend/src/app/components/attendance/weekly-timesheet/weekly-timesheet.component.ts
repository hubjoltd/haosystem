import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { ToastService } from '../../../services/toast.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface DailyRecord {
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  overtime: number;
  status: string;
  lunchBreak?: number;
}

interface EmployeeSummary {
  employeeId: number;
  employeeCode: string;
  name: string;
  department: string;
  project: string;
  daysAttended: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  records: DailyRecord[];
}

interface ProjectSummary {
  id: string;
  name: string;
  employeeCount: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}

@Component({
  selector: 'app-weekly-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './weekly-timesheet.component.html',
  styleUrls: ['./weekly-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeeklyTimesheetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loading = false;
  dataLoaded = false;
  generating = false;

  companyName = 'HAO Construction & Engineering';

  selectedDate: string = '';
  periodStartDate: string = '';
  periodEndDate: string = '';
  fromDate: string = '';
  toDate: string = '';

  viewMode: 'employee' | 'project' = 'employee';

  searchQuery: string = '';
  selectedEmployeeFilter: string = 'all';

  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  employeeSummaries: EmployeeSummary[] = [];
  projectSummaries: ProjectSummary[] = [];

  totalEmployees = 0;
  totalHours = 0;
  totalOvertime = 0;

  showEmployeeModal = false;
  selectedEmployeeSummary: EmployeeSummary | null = null;
  employeeWeekRecords: DailyRecord[] = [];

  showProjectModal = false;
  selectedProjectSummary: ProjectSummary | null = null;
  projectEmployees: EmployeeSummary[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setCurrentPeriod();
    this.loadData();
  }

  setCurrentPeriod(): void {
    const today = new Date();
    this.selectedDate = this.formatDate(today);
    this.calculatePeriodDates();
  }

  calculatePeriodDates(): void {
    const selected = new Date(this.selectedDate + 'T12:00:00');
    const dayOfWeek = selected.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const periodStart = new Date(selected);
    periodStart.setDate(selected.getDate() + mondayOffset);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);

    this.periodStartDate = this.formatDate(periodStart);
    this.periodEndDate = this.formatDate(periodEnd);
    this.fromDate = this.periodStartDate;
    this.toDate = this.periodEndDate;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getCurrentDateFormatted(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  }

  loadData(): void {
    if (this.dataLoaded) return;

    this.loading = true;
    this.cdr.detectChanges();

    this.employeeService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees.filter((e: Employee) => e.active);
        this.loadAttendanceRecords();
      },
      error: (err: any) => {
        console.error('Error loading employees:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAttendanceRecords(): void {
    const startDate = this.fromDate || this.periodStartDate;
    const endDate = this.toDate || this.periodEndDate;

    this.attendanceService.getByDateRange(startDate, endDate).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.attendanceRecords = records.filter(r =>
          r.approvalStatus === 'APPROVED' || r.status === 'APPROVED'
        );
        this.processData();
      },
      error: (err: any) => {
        console.error('Error loading attendance:', err);
        this.attendanceRecords = [];
        this.processData();
      }
    });
  }

  processData(): void {
    const employeeMap = new Map<number, EmployeeSummary>();
    const projectMap = new Map<string, ProjectSummary>();

    this.attendanceRecords.forEach(record => {
      const empId = record.employee?.id || record.employeeId;
      if (!empId) return;

      const emp = this.employees.find(e => e.id === empId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` :
                      (record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Unknown');
      const empCode = emp?.employeeCode || record.employee?.employeeCode || '';
      const deptName = emp?.department?.name || '';
      const projectName = record.projectName || emp?.project?.name || 'Unassigned';

      const hours = record.regularHours || 0;
      const overtime = record.overtimeHours || 0;

      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employeeId: empId,
          employeeCode: empCode,
          name: empName,
          department: deptName,
          project: projectName,
          daysAttended: 0,
          regularHours: 0,
          overtimeHours: 0,
          totalHours: 0,
          records: []
        });
      }

      const empSummary = employeeMap.get(empId)!;
      empSummary.daysAttended++;
      empSummary.regularHours += hours;
      empSummary.overtimeHours += overtime;
      empSummary.totalHours += hours + overtime;
      empSummary.records.push({
        date: record.attendanceDate,
        clockIn: record.clockIn ? record.clockIn.substring(0, 5) : '',
        clockOut: record.clockOut ? record.clockOut.substring(0, 5) : '',
        hours: hours,
        overtime: overtime,
        status: record.approvalStatus || 'approved',
        lunchBreak: record.breakDuration || 0
      });

      const projName = record.projectName || 'Unassigned';
      const projectId = record.projectCode || 'unassigned';

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          name: projName,
          employeeCount: 0,
          regularHours: 0,
          overtimeHours: 0,
          totalHours: 0
        });
      }

      const projectSummary = projectMap.get(projectId)!;
      projectSummary.regularHours += hours;
      projectSummary.overtimeHours += overtime;
      projectSummary.totalHours += hours + overtime;
    });

    projectMap.forEach(project => {
      const uniqueEmployees = new Set<number>();
      this.attendanceRecords
        .filter(r => (r.projectCode || 'unassigned') === project.id)
        .forEach(r => {
          const empId = r.employee?.id || r.employeeId;
          if (empId) uniqueEmployees.add(empId);
        });
      project.employeeCount = uniqueEmployees.size;
    });

    employeeMap.forEach(emp => {
      emp.records.sort((a, b) => a.date.localeCompare(b.date));
    });

    this.employeeSummaries = Array.from(employeeMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    this.projectSummaries = Array.from(projectMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    this.totalEmployees = this.employeeSummaries.length;
    this.totalHours = this.employeeSummaries.reduce((sum, e) => sum + e.totalHours, 0);
    this.totalOvertime = this.employeeSummaries.reduce((sum, e) => sum + e.overtimeHours, 0);

    this.cdr.detectChanges();
  }

  onDateChange(): void {
    this.calculatePeriodDates();
    this.dataLoaded = false;
    this.loadData();
  }

  onFromDateChange(): void {
    this.dataLoaded = false;
    this.loadData();
  }

  onToDateChange(): void {
    this.dataLoaded = false;
    this.loadData();
  }

  getWeekRangeDisplay(): string {
    const start = new Date(this.fromDate || this.periodStartDate);
    const end = new Date(this.toDate || this.periodEndDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    const first = parts[0]?.charAt(0) || '';
    const last = parts[parts.length - 1]?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  formatDateShort(dateStr: string): string {
    return dateStr;
  }

  formatDateFull(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getDayFullName(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  isWeekend(dateStr: string): boolean {
    const date = new Date(dateStr + 'T12:00:00');
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  get filteredEmployeeSummaries(): EmployeeSummary[] {
    let filtered = [...this.employeeSummaries];

    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query)
      );
    }

    if (this.selectedEmployeeFilter && this.selectedEmployeeFilter !== 'all') {
      filtered = filtered.filter(emp =>
        emp.employeeId.toString() === this.selectedEmployeeFilter
      );
    }

    return filtered;
  }

  generateTimesheet(): void {
    this.generating = true;
    this.dataLoaded = false;
    this.cdr.markForCheck();

    this.employeeService.getAll().subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees.filter((e: Employee) => e.active);
        const startDate = this.fromDate || this.periodStartDate;
        const endDate = this.toDate || this.periodEndDate;
        this.attendanceService.getByDateRange(startDate, endDate).pipe(
          finalize(() => {
            this.generating = false;
            this.dataLoaded = true;
            this.cdr.markForCheck();
          })
        ).subscribe({
          next: (records: AttendanceRecord[]) => {
            this.attendanceRecords = records.filter(r =>
              r.approvalStatus === 'APPROVED' || r.status === 'APPROVED'
            );
            this.processData();
            this.toastService.success('Timesheet generated successfully');
          },
          error: (err: any) => {
            console.error('Error generating timesheet:', err);
            this.toastService.error('Failed to generate timesheet');
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading employees:', err);
        this.generating = false;
        this.toastService.error('Failed to load employees');
        this.cdr.markForCheck();
      }
    });
  }

  openEmployeeModal(emp: EmployeeSummary): void {
    this.selectedEmployeeSummary = emp;
    this.employeeWeekRecords = this.buildFullWeekRecords(emp);
    this.showEmployeeModal = true;
    this.cdr.markForCheck();
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
    this.selectedEmployeeSummary = null;
    this.employeeWeekRecords = [];
    this.cdr.markForCheck();
  }

  buildFullWeekRecords(emp: EmployeeSummary): DailyRecord[] {
    const startDate = new Date((this.fromDate || this.periodStartDate) + 'T12:00:00');
    const endDate = new Date((this.toDate || this.periodEndDate) + 'T12:00:00');
    const records: DailyRecord[] = [];
    const existingMap = new Map<string, DailyRecord>();

    emp.records.forEach(r => {
      existingMap.set(r.date, r);
    });

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = this.formatDate(current);
      const day = current.getDay();
      const isWeekend = day === 0 || day === 6;

      if (isWeekend) {
        records.push({
          date: dateStr,
          clockIn: '-',
          clockOut: '-',
          hours: 0,
          overtime: 0,
          status: 'Weekend Off',
          lunchBreak: 0
        });
      } else {
        const existing = existingMap.get(dateStr);
        if (existing) {
          records.push(existing);
        } else {
          records.push({
            date: dateStr,
            clockIn: '',
            clockOut: '',
            hours: 0,
            overtime: 0,
            status: 'absent',
            lunchBreak: 0
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return records;
  }

  openProjectModal(project: ProjectSummary): void {
    this.selectedProjectSummary = project;
    this.projectEmployees = this.employeeSummaries.filter(emp => {
      return emp.records.some(r => {
        const matchingRecord = this.attendanceRecords.find(ar =>
          ar.attendanceDate === r.date &&
          ((ar.employee?.id || ar.employeeId) === emp.employeeId) &&
          (ar.projectCode || 'unassigned') === project.id
        );
        return !!matchingRecord;
      });
    });
    this.showProjectModal = true;
    this.cdr.markForCheck();
  }

  closeProjectModal(): void {
    this.showProjectModal = false;
    this.selectedProjectSummary = null;
    this.projectEmployees = [];
    this.cdr.markForCheck();
  }

  viewProjectEmployeeDetail(emp: EmployeeSummary): void {
    this.closeProjectModal();
    setTimeout(() => {
      this.openEmployeeModal(emp);
    }, 100);
  }

  getEmployeeTotalRegular(): number {
    return this.employeeWeekRecords.reduce((sum, r) => sum + r.hours, 0);
  }

  getEmployeeTotalOT(): number {
    return this.employeeWeekRecords.reduce((sum, r) => sum + r.overtime, 0);
  }

  getEmployeeTotalHours(): number {
    return this.getEmployeeTotalRegular() + this.getEmployeeTotalOT();
  }

  getRecordTotal(record: DailyRecord): number {
    return record.hours + record.overtime;
  }

  downloadCurrentEmployeePDF(): void {
    if (!this.selectedEmployeeSummary) return;
    try {
      this.downloadEmployeePDFFromSummary(this.selectedEmployeeSummary);
    } catch (err) {
      console.error('PDF download error:', err);
      this.toastService.error('Failed to generate PDF. Please try again.');
    }
  }

  downloadEmployeePDFFromSummary(emp: EmployeeSummary): void {
    const doc = new jsPDF('portrait');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const teal: [number, number, number] = [0, 128, 128];
    const darkTeal: [number, number, number] = [0, 102, 102];
    const lightGray: [number, number, number] = [245, 247, 250];
    const white: [number, number, number] = [255, 255, 255];

    doc.setFillColor(...teal);
    doc.rect(0, 0, pageWidth, 36, 'F');

    doc.setFillColor(...darkTeal);
    doc.rect(0, 36, pageWidth, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(this.companyName.toUpperCase(), margin, 12);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Timesheet', margin, 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${this.getWeekRangeDisplay()}`, margin, 33);

    doc.setFontSize(8);
    doc.text(this.getCurrentDateFormatted(), pageWidth - margin, 12, { align: 'right' });

    let yPos = 48;

    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const col1 = margin + 6;
    const col2 = margin + contentWidth * 0.5;

    doc.text('EMPLOYEE ID', col1, yPos + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(emp.employeeCode || '-', col1, yPos + 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('DEPARTMENT', col2, yPos + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(emp.department || '-', col2, yPos + 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('EMPLOYEE NAME', col1, yPos + 22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(emp.name, col1, yPos + 28);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('STATUS', col2, yPos + 22);
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(col2, yPos + 24, 22, 6, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Approved', col2 + 2.5, yPos + 28.5);

    yPos += 36;

    const allRecords = this.buildFullWeekRecords(emp);
    const tableData = allRecords.map((r, i) => {
      const isWknd = r.status === 'Weekend Off';
      const statusLabel = isWknd ? 'Weekend Off' :
        r.status === 'Holiday' ? 'Holiday' :
        r.status === 'leave' ? 'On Leave' :
        r.hours > 0 ? 'Present' : '-';
      return [
        (i + 1).toString(),
        this.formatDateFull(r.date),
        this.getDayName(r.date),
        isWknd ? '-' : (r.clockIn || '-'),
        isWknd ? '-' : (r.clockOut || '-'),
        isWknd ? '-' : (r.lunchBreak ? r.lunchBreak + ' min' : '-'),
        isWknd ? '-' : r.hours.toFixed(1),
        isWknd ? '-' : r.overtime.toFixed(1),
        isWknd ? '-' : (r.hours + r.overtime).toFixed(1),
        statusLabel
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Date', 'Day', 'In', 'Out', 'Lunch', 'Regular', 'OT', 'Total', 'Status']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: darkTeal,
        textColor: white,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7.5,
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 }
      },
      bodyStyles: {
        halign: 'center',
        fontSize: 8,
        cellPadding: { top: 3.5, bottom: 3.5, left: 2, right: 2 },
        textColor: [60, 60, 60],
        lineColor: [230, 232, 236],
        lineWidth: { bottom: 0.2, top: 0, left: 0, right: 0 }
      },
      alternateRowStyles: {
        fillColor: [250, 251, 253]
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 24, halign: 'left' },
        2: { cellWidth: 12 },
        3: { cellWidth: 14 },
        4: { cellWidth: 14 },
        5: { cellWidth: 14 },
        6: { cellWidth: 16 },
        7: { cellWidth: 14 },
        8: { cellWidth: 16, fontStyle: 'bold' },
        9: { cellWidth: 'auto', halign: 'center' }
      },
      styles: {
        overflow: 'ellipsize'
      },
      margin: { left: margin, right: margin },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 9) {
          const val = data.cell.raw;
          if (val === 'Present') {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Weekend Off') {
            data.cell.styles.textColor = [156, 163, 175];
            data.cell.styles.fontStyle = 'italic';
          } else if (val === 'Holiday') {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'On Leave') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        if (data.section === 'body' && data.column.index === 7) {
          const val = parseFloat(data.cell.raw);
          if (!isNaN(val) && val > 0) {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        if (data.section === 'body') {
          const statusVal = data.row.raw?.[9];
          if (statusVal === 'Weekend Off') {
            data.cell.styles.fillColor = [243, 244, 246];
            if (data.column.index !== 9) {
              data.cell.styles.textColor = [180, 180, 180];
            }
          }
        }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 4;

    if (yPos + 30 > pageHeight) {
      doc.addPage();
      yPos = 20;
    }

    const boxW = contentWidth / 3 - 3;
    const boxH = 18;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPos, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, yPos, boxW, boxH, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('REGULAR HOURS', margin + boxW / 2, yPos + 6, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(emp.regularHours.toFixed(1) + 'h', margin + boxW / 2, yPos + 14, { align: 'center' });

    const box2X = margin + boxW + 4.5;
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(box2X, yPos, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.roundedRect(box2X, yPos, boxW, boxH, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('OVERTIME HOURS', box2X + boxW / 2, yPos + 6, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(emp.overtimeHours.toFixed(1) + 'h', box2X + boxW / 2, yPos + 14, { align: 'center' });

    const box3X = box2X + boxW + 4.5;
    doc.setFillColor(224, 242, 254);
    doc.roundedRect(box3X, yPos, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(0, 128, 128);
    doc.setLineWidth(0.4);
    doc.roundedRect(box3X, yPos, boxW, boxH, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL HOURS', box3X + boxW / 2, yPos + 6, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 102);
    doc.text(emp.totalHours.toFixed(1) + 'h', box3X + boxW / 2, yPos + 14, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a system-generated document.', pageWidth / 2, pageHeight - 8, { align: 'center' });

    const fileName = `Timesheet_${emp.name.replace(/\s+/g, '_')}_${this.periodStartDate}.pdf`;
    try {
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.toastService.success('PDF downloaded successfully');
    } catch (e) {
      doc.save(fileName);
      this.toastService.success('PDF downloaded successfully');
    }
  }

  downloadCurrentEmployeeExcel(): void {
    if (!this.selectedEmployeeSummary) return;
    this.downloadEmployeeExcel(this.selectedEmployeeSummary);
  }

  downloadEmployeeExcel(emp: EmployeeSummary): void {
    const allRecords = this.buildFullWeekRecords(emp);
    const data = allRecords.map((r, i) => ({
      '#': i + 1,
      'Date': this.formatDateFull(r.date),
      'Day': this.getDayFullName(r.date),
      'Clock In': r.clockIn || '-',
      'Clock Out': r.clockOut || '-',
      'Lunch': r.lunchBreak ? r.lunchBreak + ' min' : '-',
      'Regular Hours': r.hours.toFixed(1),
      'OT Hours': r.overtime.toFixed(1),
      'Total Hours': (r.hours + r.overtime).toFixed(1),
      'Status': r.status === 'Weekend Off' ? 'Weekend Off' : (r.status === 'Holiday' ? 'Holiday' : (r.status === 'leave' ? 'On Leave' : (r.hours > 0 ? 'Approved' : '-')))
    }));

    data.push({
      '#': '' as any,
      'Date': '',
      'Day': '',
      'Clock In': '',
      'Clock Out': '',
      'Lunch': 'TOTAL',
      'Regular Hours': emp.regularHours.toFixed(1),
      'OT Hours': emp.overtimeHours.toFixed(1),
      'Total Hours': emp.totalHours.toFixed(1),
      'Status': ''
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');
    XLSX.writeFile(wb, `Timesheet_${emp.name.replace(/\s+/g, '_')}_${this.periodStartDate}.xlsx`);
    this.toastService.success('Excel downloaded');
  }

  downloadPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(0, 100, 100);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(this.companyName, 14, 13);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Weekly Timesheet Report', 14, 22);

    doc.setFontSize(9);
    doc.setTextColor(255, 100, 100);
    doc.text(`Generated on ${this.getCurrentDateFormatted()}`, pageWidth - 14, 18, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Period: ${this.getWeekRangeDisplay()}`, 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Employees: ${this.totalEmployees}`, 14, 48);
    doc.text(`Total Hours: ${this.totalHours.toFixed(1)}h`, 80, 48);
    doc.text(`Total OT: ${this.totalOvertime.toFixed(1)}h`, 140, 48);

    if (this.viewMode === 'employee') {
      const tableData = this.filteredEmployeeSummaries.map(emp => [
        emp.employeeCode || '-',
        emp.name,
        emp.project || '-',
        this.getWeekRangeDisplay(),
        emp.regularHours.toFixed(1) + ' hrs',
        emp.overtimeHours.toFixed(1) + ' hrs',
        emp.totalHours.toFixed(1) + ' hrs',
        'Approved'
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['Emp ID', 'Employee', 'Project', 'Period', 'Regular', 'OT', 'Total', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] }
      });
    } else {
      const tableData = this.projectSummaries.map(proj => [
        proj.name,
        proj.employeeCount + ' employees',
        proj.regularHours.toFixed(0) + ' hrs',
        proj.overtimeHours.toFixed(0) + ' hrs',
        proj.totalHours.toFixed(0) + ' hrs'
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['Project', 'Employees', 'Regular', 'OT', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] }
      });
    }

    const fileName = `Weekly_Timesheet_${this.periodStartDate}_${this.periodEndDate}.pdf`;
    try {
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.toastService.success('PDF downloaded');
    } catch (e) {
      doc.save(fileName);
      this.toastService.success('PDF downloaded');
    }
  }

  downloadExcel(): void {
    let data: any[];

    if (this.viewMode === 'employee') {
      data = this.filteredEmployeeSummaries.map(emp => ({
        'Employee ID': emp.employeeCode || '-',
        'Employee': emp.name,
        'Project': emp.project || '-',
        'Week Period': this.getWeekRangeDisplay(),
        'Regular Hours': emp.regularHours.toFixed(1),
        'OT Hours': emp.overtimeHours.toFixed(1),
        'Total Hours': emp.totalHours.toFixed(1),
        'Status': 'Approved'
      }));
    } else {
      data = this.projectSummaries.map(proj => ({
        'Project Name': proj.name,
        'Employees': proj.employeeCount,
        'Regular Hours': proj.regularHours.toFixed(0),
        'OT Hours': proj.overtimeHours.toFixed(0),
        'Total Hours': proj.totalHours.toFixed(0)
      }));
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');
    XLSX.writeFile(wb, `Weekly_Timesheet_${this.periodStartDate}_${this.periodEndDate}.xlsx`);
    this.toastService.success('Excel downloaded');
  }

  downloadCSV(): void {
    let csvContent = '';

    if (this.viewMode === 'employee') {
      csvContent = 'Employee ID,Employee,Project,Period,Regular Hours,OT Hours,Total Hours,Status\n';
      this.filteredEmployeeSummaries.forEach(emp => {
        csvContent += `"${emp.employeeCode || ''}","${emp.name}","${emp.project || ''}","${this.getWeekRangeDisplay()}",${emp.regularHours.toFixed(1)},${emp.overtimeHours.toFixed(1)},${emp.totalHours.toFixed(1)},Approved\n`;
      });
    } else {
      csvContent = 'Project,Employees,Regular Hours,OT Hours,Total Hours\n';
      this.projectSummaries.forEach(proj => {
        csvContent += `"${proj.name}",${proj.employeeCount},${proj.regularHours.toFixed(1)},${proj.overtimeHours.toFixed(1)},${proj.totalHours.toFixed(1)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Weekly_Timesheet_${this.periodStartDate}_${this.periodEndDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toastService.success('CSV downloaded');
  }

  downloadProjectExcel(): void {
    if (!this.selectedProjectSummary) return;

    const data = this.projectEmployees.map(emp => ({
      'Employee ID': emp.employeeCode || '-',
      'Employee Name': emp.name,
      'Period': this.getWeekRangeDisplay(),
      'Regular Hours': emp.regularHours.toFixed(1),
      'OT Hours': emp.overtimeHours.toFixed(1),
      'Total Hours': emp.totalHours.toFixed(1)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.selectedProjectSummary.name);
    XLSX.writeFile(wb, `Project_${this.selectedProjectSummary.name.replace(/\s+/g, '_')}_Timesheet.xlsx`);
    this.toastService.success('Excel downloaded');
  }

  downloadProjectPDF(): void {
    if (!this.selectedProjectSummary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(0, 100, 100);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(this.companyName, 14, 16);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(this.selectedProjectSummary.name, 14, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${this.getWeekRangeDisplay()}`, 14, 48);

    const tableData = this.projectEmployees.map(emp => [
      emp.employeeCode || '-',
      emp.name,
      this.getWeekRangeDisplay(),
      emp.regularHours.toFixed(1) + ' hrs',
      emp.overtimeHours.toFixed(1) + ' hrs',
      emp.totalHours.toFixed(1) + ' hrs'
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Employee ID', 'Employee Name', 'Period', 'Regular Hours', 'OT Hours', 'Total Hours']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });

    doc.save(`Project_${this.selectedProjectSummary.name.replace(/\s+/g, '_')}_Timesheet.pdf`);
    this.toastService.success('PDF downloaded');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
