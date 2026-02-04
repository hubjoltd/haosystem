import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { ToastService } from '../../../services/toast.service';
import { finalize } from 'rxjs/operators';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface DailyRecord {
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  overtime: number;
  status: string;
}

interface EmployeeSummary {
  employeeId: number;
  employeeCode: string;
  name: string;
  department: string;
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
export class WeeklyTimesheetComponent implements OnInit {
  loading = false;
  dataLoaded = false;
  generating = false;

  selectedDate: string = '';
  periodStartDate: string = '';
  periodEndDate: string = '';

  viewMode: 'employee' | 'project' = 'employee';

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
    const selected = new Date(this.selectedDate);
    const dayOfWeek = selected.getDay();
    const sundayOffset = dayOfWeek === 0 ? 0 : -dayOfWeek;
    
    const periodStart = new Date(selected);
    periodStart.setDate(selected.getDate() + sundayOffset);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);
    
    this.periodStartDate = this.formatDate(periodStart);
    this.periodEndDate = this.formatDate(periodEnd);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadData(): void {
    if (this.dataLoaded) return;
    
    this.loading = true;
    this.cdr.detectChanges();

    this.employeeService.getAll().subscribe({
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
    this.attendanceService.getByDateRange(this.periodStartDate, this.periodEndDate).pipe(
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
      
      const hours = record.regularHours || 0;
      const overtime = record.overtimeHours || 0;

      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employeeId: empId,
          employeeCode: empCode,
          name: empName,
          department: deptName,
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
        status: record.approvalStatus || 'approved'
      });

      const projectName = record.projectName || 'Unassigned';
      const projectId = record.projectCode || 'unassigned';

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          name: projectName,
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

  getWeekRangeDisplay(): string {
    const start = new Date(this.periodStartDate);
    const end = new Date(this.periodEndDate);
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  generateTimesheet(): void {
    this.generating = true;
    this.dataLoaded = false;
    this.cdr.markForCheck();
    
    this.employeeService.getAll().subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees.filter((e: Employee) => e.active);
        this.attendanceService.getByDateRange(this.periodStartDate, this.periodEndDate).pipe(
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
    this.employeeWeekRecords = emp.records;
    this.showEmployeeModal = true;
    this.cdr.markForCheck();
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
    this.selectedEmployeeSummary = null;
    this.employeeWeekRecords = [];
    this.cdr.markForCheck();
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

  downloadCurrentEmployeePDF(): void {
    if (!this.selectedEmployeeSummary) return;
    this.downloadEmployeePDFFromSummary(this.selectedEmployeeSummary);
  }

  downloadEmployeePDFFromSummary(emp: EmployeeSummary): void {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(51, 102, 153);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE TIMESHEET', 14, 18);
    doc.setFontSize(10);
    doc.text(this.getWeekRangeDisplay(), pageWidth - 14, 18, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    
    let yPos = 45;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Employee Name: ${emp.name}`, 14, yPos);
    doc.text(`Employee ID: ${emp.employeeCode || '-'}`, 120, yPos);
    yPos += 6;
    doc.text(`Department: ${emp.department || '-'}`, 14, yPos);
    yPos += 12;

    const tableData = emp.records.map(r => [
      this.formatDateShort(r.date),
      this.getDayName(r.date),
      r.clockIn || '-',
      r.clockOut || '-',
      r.hours > 0 ? r.hours.toFixed(2) : '-',
      r.overtime > 0 ? r.overtime.toFixed(2) : '-'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Day', 'Check In', 'Check Out', 'Regular Hrs', 'OT Hrs']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [200, 200, 200], 
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center',
        fontSize: 9
      },
      margin: { left: 14, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(51, 102, 153);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 20, yPos + 6);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const regularTotal = emp.regularHours.toFixed(1);
    const otTotal = emp.overtimeHours.toFixed(1);
    const grandTotal = emp.totalHours.toFixed(1);
    
    doc.text(`Regular Hours All: ${regularTotal}H`, 20, yPos);
    doc.text(`Overtime Hours All: ${otTotal}H`, 100, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Hours All: ${grandTotal}H`, 180, yPos);

    const fileName = `Timesheet_${emp.name.replace(/\s+/g, '_')}_${this.periodStartDate}.pdf`;
    doc.save(fileName);
    this.toastService.success('PDF downloaded');
  }

  downloadPDF(): void {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Weekly Timesheet Report', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Period: ${this.getWeekRangeDisplay()}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

    doc.setFontSize(10);
    doc.text(`Total Employees: ${this.totalEmployees}`, 14, 48);
    doc.text(`Total Hours: ${this.totalHours.toFixed(1)}h`, 80, 48);
    doc.text(`Total OT: ${this.totalOvertime.toFixed(1)}h`, 140, 48);

    if (this.viewMode === 'employee') {
      const tableData = this.employeeSummaries.map(emp => [
        emp.name,
        emp.employeeCode || '-',
        emp.daysAttended.toString(),
        emp.regularHours.toFixed(1),
        emp.overtimeHours.toFixed(1),
        emp.totalHours.toFixed(1)
      ]);

      doc.autoTable({
        startY: 55,
        head: [['Employee', 'ID', 'Days', 'Regular', 'OT', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] }
      });
    } else {
      const tableData = this.projectSummaries.map(proj => [
        proj.name,
        proj.employeeCount.toString(),
        proj.regularHours.toFixed(1),
        proj.overtimeHours.toFixed(1),
        proj.totalHours.toFixed(1)
      ]);

      doc.autoTable({
        startY: 55,
        head: [['Project', 'Employees', 'Regular', 'OT', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] }
      });
    }

    doc.save(`Weekly_Timesheet_${this.periodStartDate}_${this.periodEndDate}.pdf`);
    this.toastService.success('PDF downloaded');
  }

  downloadCSV(): void {
    let csvContent = '';
    
    if (this.viewMode === 'employee') {
      csvContent = 'Employee,Employee ID,Days Attended,Regular Hours,OT Hours,Total Hours\n';
      this.employeeSummaries.forEach(emp => {
        csvContent += `"${emp.name}","${emp.employeeCode || ''}",${emp.daysAttended},${emp.regularHours.toFixed(1)},${emp.overtimeHours.toFixed(1)},${emp.totalHours.toFixed(1)}\n`;
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
}
