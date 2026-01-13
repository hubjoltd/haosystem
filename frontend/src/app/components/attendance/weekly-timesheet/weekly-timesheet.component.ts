import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { finalize } from 'rxjs/operators';

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

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
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
}
