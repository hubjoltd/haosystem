import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';

interface WeeklyEmployee {
  id: number;
  name: string;
  code: string;
  projects: WeeklyProject[];
  totalHours: number;
  dayHours: number[];
}

interface WeeklyProject {
  code: string;
  name: string;
  hours: number[];
  totalHours: number;
}

@Component({
  selector: 'app-weekly-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weekly-timesheet.component.html',
  styleUrls: ['./weekly-timesheet.component.scss']
})
export class WeeklyTimesheetComponent implements OnInit {
  loading = false;
  message = '';
  messageType = '';

  employees: Employee[] = [];
  weeklyData: WeeklyEmployee[] = [];
  attendanceRecords: AttendanceRecord[] = [];

  weekStartDate: string = '';
  weekEndDate: string = '';
  weekDates: string[] = [];
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  totalEmployees = 0;
  totalProjects = 0;
  totalHours = 0;
  averageHours = 0;

  showGenerateModal = false;
  generateWeekStart: string = '';
  generateStatus = 'PRESENT';
  generateHoursPerDay = 8;
  selectedEmployeeIds: number[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.setCurrentWeek();
    this.loadEmployees();
  }

  setCurrentWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    this.weekStartDate = this.formatDate(monday);
    this.weekEndDate = this.formatDate(sunday);
    this.generateWeekDates();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  generateWeekDates(): void {
    this.weekDates = [];
    const start = new Date(this.weekStartDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      this.weekDates.push(this.formatDate(d));
    }
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data: Employee[]) => {
        this.employees = data.filter((e: Employee) => e.active);
        this.loadWeeklyAttendance();
      },
      error: (err: any) => console.error('Error loading employees:', err)
    });
  }

  loadWeeklyAttendance(): void {
    this.loading = true;
    this.weeklyData = [];

    let completedCount = 0;
    const allRecords: AttendanceRecord[] = [];

    if (this.employees.length === 0) {
      this.loading = false;
      this.calculateSummary();
      return;
    }

    this.employees.forEach(emp => {
      this.attendanceService.getByEmployeeAndDateRange(emp.id!, this.weekStartDate, this.weekEndDate).subscribe({
        next: (records) => {
          allRecords.push(...records);
          completedCount++;
          if (completedCount === this.employees.length) {
            this.processWeeklyData(allRecords);
          }
        },
        error: () => {
          completedCount++;
          if (completedCount === this.employees.length) {
            this.processWeeklyData(allRecords);
          }
        }
      });
    });
  }

  processWeeklyData(records: AttendanceRecord[]): void {
    const employeeMap = new Map<number, WeeklyEmployee>();

    this.employees.forEach(emp => {
      employeeMap.set(emp.id!, {
        id: emp.id!,
        name: `${emp.firstName} ${emp.lastName}`,
        code: emp.employeeCode || '',
        projects: [],
        totalHours: 0,
        dayHours: [0, 0, 0, 0, 0, 0, 0]
      });
    });

    records.forEach(record => {
      const empId = record.employee?.id || record.employeeId;
      if (!empId) return;

      const empData = employeeMap.get(empId);
      if (!empData) return;

      const dateIdx = this.weekDates.indexOf(record.attendanceDate);
      if (dateIdx === -1) return;

      const hours = (record.regularHours || 0) + (record.overtimeHours || 0);
      empData.dayHours[dateIdx] += hours;
      empData.totalHours += hours;

      let project = empData.projects.find(p => p.code === 'DEFAULT');
      if (!project) {
        project = {
          code: 'DEFAULT',
          name: 'General Work',
          hours: [0, 0, 0, 0, 0, 0, 0],
          totalHours: 0
        };
        empData.projects.push(project);
      }
      project.hours[dateIdx] += hours;
      project.totalHours += hours;
    });

    this.weeklyData = Array.from(employeeMap.values());
    this.loading = false;
    this.calculateSummary();
  }

  calculateSummary(): void {
    this.totalEmployees = this.weeklyData.length;
    
    const projectSet = new Set<string>();
    this.weeklyData.forEach(emp => {
      emp.projects.forEach(p => projectSet.add(p.code));
    });
    this.totalProjects = projectSet.size;

    this.totalHours = this.weeklyData.reduce((sum, emp) => sum + emp.totalHours, 0);
    this.averageHours = this.totalEmployees > 0 ? this.totalHours / this.totalEmployees : 0;
  }

  onWeekChange(): void {
    this.generateWeekDates();
    this.loadWeeklyAttendance();
  }

  previousWeek(): void {
    const start = new Date(this.weekStartDate);
    start.setDate(start.getDate() - 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    this.weekStartDate = this.formatDate(start);
    this.weekEndDate = this.formatDate(end);
    this.onWeekChange();
  }

  nextWeek(): void {
    const start = new Date(this.weekStartDate);
    start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    this.weekStartDate = this.formatDate(start);
    this.weekEndDate = this.formatDate(end);
    this.onWeekChange();
  }

  openGenerateModal(): void {
    this.generateWeekStart = this.weekStartDate;
    this.selectedEmployeeIds = this.employees.map(e => e.id!);
    this.generateStatus = 'PRESENT';
    this.generateHoursPerDay = 8;
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
  }

  toggleEmployeeSelection(empId: number): void {
    const idx = this.selectedEmployeeIds.indexOf(empId);
    if (idx > -1) {
      this.selectedEmployeeIds.splice(idx, 1);
    } else {
      this.selectedEmployeeIds.push(empId);
    }
  }

  isEmployeeSelected(empId: number): boolean {
    return this.selectedEmployeeIds.includes(empId);
  }

  selectAllEmployees(): void {
    if (this.selectedEmployeeIds.length === this.employees.length) {
      this.selectedEmployeeIds = [];
    } else {
      this.selectedEmployeeIds = this.employees.map(e => e.id!);
    }
  }

  generateWeeklyAttendance(): void {
    if (this.selectedEmployeeIds.length === 0) {
      this.showMessage('Please select at least one employee', 'error');
      return;
    }

    this.loading = true;
    const weekDates: string[] = [];
    const start = new Date(this.generateWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDates.push(this.formatDate(d));
    }

    let totalEntries = this.selectedEmployeeIds.length * weekDates.length;
    let completedEntries = 0;
    let errorCount = 0;

    this.selectedEmployeeIds.forEach(empId => {
      weekDates.forEach(date => {
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        const status = isWeekend ? 'WEEKEND' : this.generateStatus;
        const hours = isWeekend ? 0 : this.generateHoursPerDay;

        const record: AttendanceRecord = {
          employeeId: empId,
          attendanceDate: date,
          status: status,
          regularHours: hours,
          overtimeHours: 0,
          captureMethod: 'AUTO_GENERATED',
          clockIn: isWeekend ? undefined : '09:00',
          clockOut: isWeekend ? undefined : `${9 + hours}:00`
        };

        this.attendanceService.manualEntry(record).subscribe({
          next: () => {
            completedEntries++;
            this.checkGenerationComplete(completedEntries, totalEntries, errorCount);
          },
          error: () => {
            completedEntries++;
            errorCount++;
            this.checkGenerationComplete(completedEntries, totalEntries, errorCount);
          }
        });
      });
    });
  }

  checkGenerationComplete(completed: number, total: number, errors: number): void {
    if (completed === total) {
      this.loading = false;
      if (errors === 0) {
        this.showMessage(`Successfully generated attendance for ${this.selectedEmployeeIds.length} employees`, 'success');
      } else {
        this.showMessage(`Generated attendance with ${errors} errors (some records may already exist)`, 'warning');
      }
      this.closeGenerateModal();
      this.loadWeeklyAttendance();
    }
  }

  formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getWeekRangeDisplay(): string {
    const start = new Date(this.weekStartDate);
    const end = new Date(this.weekEndDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 4000);
  }

  getHoursVariance(actual: number, expected: number = 40): { value: number; positive: boolean; display: string } {
    const variance = actual - expected;
    const sign = variance >= 0 ? '+' : '';
    return { 
      value: variance, 
      positive: variance >= 0,
      display: `${sign}${variance.toFixed(1)}h`
    };
  }
}
