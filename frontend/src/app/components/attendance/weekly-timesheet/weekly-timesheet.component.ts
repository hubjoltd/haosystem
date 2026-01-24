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

interface TimesheetRecord {
  employeeId: number;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  overtime: number;
  status: string;
}

interface ProjectGroup {
  id: string;
  name: string;
  employeeCount: number;
  totalHours: number;
  expanded: boolean;
  records: TimesheetRecord[];
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

  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  projectGroups: ProjectGroup[] = [];

  totalEmployees = 0;
  totalProjects = 0;
  totalHours = 0;
  totalOvertime = 0;

  // Employee timesheet modal
  showEmployeeModal = false;
  selectedEmployee: TimesheetRecord | null = null;
  employeeWeekRecords: TimesheetRecord[] = [];

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
    const projectMap = new Map<string, ProjectGroup>();
    const employeeSet = new Set<number>();

    this.attendanceRecords.forEach(record => {
      const empId = record.employee?.id || record.employeeId;
      if (!empId) return;

      const emp = this.employees.find(e => e.id === empId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : 
                      (record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Unknown');
      
      const projectName = record.project?.name || record.projectName || 'Unknown';
      const projectId = record.project?.id?.toString() || record.projectName || 'unknown';

      employeeSet.add(empId);

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          name: projectName,
          employeeCount: 0,
          totalHours: 0,
          expanded: false,
          records: []
        });
      }

      const group = projectMap.get(projectId)!;
      const hours = record.regularHours || 0;
      const overtime = record.overtimeHours || 0;

      group.records.push({
        employeeId: empId,
        employeeName: empName,
        date: record.attendanceDate,
        clockIn: record.clockIn || '',
        clockOut: record.clockOut || '',
        hours: hours,
        overtime: overtime,
        status: record.approvalStatus || 'approved'
      });

      group.totalHours += hours + overtime;
    });

    projectMap.forEach(group => {
      const uniqueEmployees = new Set(group.records.map(r => r.employeeId));
      group.employeeCount = uniqueEmployees.size;
      group.records.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return a.employeeName.localeCompare(b.employeeName);
      });
    });

    this.projectGroups = Array.from(projectMap.values());
    
    this.totalEmployees = employeeSet.size;
    this.totalProjects = this.projectGroups.length;
    this.totalHours = this.attendanceRecords.reduce((sum, r) => sum + (r.regularHours || 0), 0);
    this.totalOvertime = this.attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    this.cdr.detectChanges();
  }

  toggleGroup(group: ProjectGroup): void {
    group.expanded = !group.expanded;
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

  formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
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

    let yPosition = 58;
    
    this.projectGroups.forEach(group => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${group.name} (${group.employeeCount} employees, ${group.totalHours.toFixed(2)}h)`, 14, yPosition);
      yPosition += 6;
      
      const tableData = group.records.map(r => [
        r.employeeName,
        this.formatDisplayDate(r.date),
        r.clockIn?.substring(0, 5) || '-',
        r.clockOut?.substring(0, 5) || '-',
        r.hours > 0 ? r.hours.toFixed(2) : '-',
        r.overtime > 0 ? r.overtime.toFixed(2) : '-'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Employee', 'Date', 'Clock In', 'Clock Out', 'Hours', 'OT']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] },
        margin: { left: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save(`Weekly_Timesheet_${this.periodStartDate}_${this.periodEndDate}.pdf`);
    this.toastService.success('PDF downloaded');
  }

  downloadCSV(): void {
    let csvContent = 'Project,Employee,Date,Clock In,Clock Out,Hours,Overtime,Status\n';

    this.projectGroups.forEach(group => {
      group.records.forEach(record => {
        csvContent += `"${group.name}","${record.employeeName}","${record.date}","${record.clockIn || ''}","${record.clockOut || ''}",${record.hours},${record.overtime},"${record.status}"\n`;
      });
    });

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

  viewEmployeeTimesheet(record: TimesheetRecord): void {
    this.selectedEmployee = record;
    this.employeeWeekRecords = [];
    
    // Get all records for this employee in the current period
    this.projectGroups.forEach(group => {
      const empRecords = group.records.filter(r => r.employeeId === record.employeeId);
      this.employeeWeekRecords.push(...empRecords);
    });
    
    // Sort by date
    this.employeeWeekRecords.sort((a, b) => a.date.localeCompare(b.date));
    
    this.showEmployeeModal = true;
    this.cdr.markForCheck();
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
    this.selectedEmployee = null;
    this.employeeWeekRecords = [];
    this.cdr.markForCheck();
  }

  getEmployeeTotalHours(): number {
    return this.employeeWeekRecords.reduce((sum, r) => sum + r.hours, 0);
  }

  getEmployeeTotalOT(): number {
    return this.employeeWeekRecords.reduce((sum, r) => sum + r.overtime, 0);
  }

  downloadEmployeePDF(record: TimesheetRecord): void {
    // Get all records for this employee
    const empRecords: TimesheetRecord[] = [];
    this.projectGroups.forEach(group => {
      const records = group.records.filter(r => r.employeeId === record.employeeId);
      empRecords.push(...records);
    });
    empRecords.sort((a, b) => a.date.localeCompare(b.date));

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Employee Weekly Timesheet', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Employee: ${record.employeeName}`, 14, 32);
    doc.text(`Period: ${this.getWeekRangeDisplay()}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48);

    const totalHours = empRecords.reduce((sum, r) => sum + r.hours, 0);
    const totalOT = empRecords.reduce((sum, r) => sum + r.overtime, 0);

    doc.setFontSize(10);
    doc.text(`Total Hours: ${totalHours.toFixed(2)}h`, 14, 58);
    doc.text(`Total Overtime: ${totalOT.toFixed(2)}h`, 80, 58);
    doc.text(`Total: ${(totalHours + totalOT).toFixed(2)}h`, 140, 58);

    const tableData = empRecords.map(r => [
      this.formatDisplayDate(r.date),
      r.clockIn?.substring(0, 5) || '-',
      r.clockOut?.substring(0, 5) || '-',
      r.hours > 0 ? r.hours.toFixed(2) : '-',
      r.overtime > 0 ? r.overtime.toFixed(2) : '-',
      r.status
    ]);

    doc.autoTable({
      startY: 68,
      head: [['Date', 'Clock In', 'Clock Out', 'Hours', 'OT', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 128, 128] },
      margin: { left: 14 },
      foot: [['Total', '', '', totalHours.toFixed(2), totalOT.toFixed(2), '']],
      footStyles: { fillColor: [0, 128, 128], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    const fileName = `Timesheet_${record.employeeName.replace(/\s+/g, '_')}_${this.periodStartDate}_${this.periodEndDate}.pdf`;
    doc.save(fileName);
    this.toastService.success('PDF downloaded');
  }
}
