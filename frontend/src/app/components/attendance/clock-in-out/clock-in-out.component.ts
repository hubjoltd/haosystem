import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';

@Component({
  selector: 'app-clock-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './clock-in-out.component.html',
  styleUrls: ['./clock-in-out.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClockInOutComponent implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  todayRecord: AttendanceRecord | null = null;
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;
  selectedEmployee: Employee | null = null;
  loadingClockIn = false;
  loadingClockOut = false;
  loadingRecord = false;
  loadingEmployees = true;
  message = '';
  messageType = '';
  
  todayActivities: AttendanceRecord[] = [];
  clockInterval: any = null;
  refreshInterval: any = null;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
      this.cdr.markForCheck();
    }, 1000);
    
    this.loadEmployees();
    this.loadTodayActivities();
    
    this.refreshInterval = setInterval(() => {
      this.loadTodayActivities();
    }, 30000);
  }
  
  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.cdr.markForCheck();
    
    this.employeeService.getAll().subscribe({
      next: (data: Employee[]) => {
        this.employees = data.filter((e: Employee) => e.active);
        if (this.employees.length > 0 && !this.selectedEmployeeId) {
          this.selectedEmployeeId = this.employees[0].id!;
          this.selectedEmployee = this.employees[0];
          this.loadEmployeeTodayRecord();
        }
        this.loadingEmployees = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading employees:', err);
        this.loadingEmployees = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadTodayActivities(): void {
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService.getByDate(today).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.todayActivities = records.filter(r => r.clockIn || r.clockOut);
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Error loading today activities:', err)
    });
  }

  onEmployeeChange(): void {
    if (this.selectedEmployeeId) {
      this.selectedEmployee = this.employees.find(e => e.id === this.selectedEmployeeId) || null;
      this.todayRecord = null;
      this.loadEmployeeTodayRecord();
    } else {
      this.selectedEmployee = null;
      this.todayRecord = null;
    }
    this.cdr.markForCheck();
  }

  loadEmployeeTodayRecord(): void {
    if (!this.selectedEmployeeId) return;
    
    this.loadingRecord = true;
    this.cdr.markForCheck();
    
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService.getByEmployeeAndDateRange(this.selectedEmployeeId, today, today).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.todayRecord = records.length > 0 ? records[0] : null;
        this.loadingRecord = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.todayRecord = null;
        this.loadingRecord = false;
        this.cdr.markForCheck();
      }
    });
  }

  clockIn(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loadingClockIn = true;
    this.cdr.markForCheck();
    
    this.attendanceService.clockIn(this.selectedEmployeeId, 'WEB').subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.showMessage('Clocked in successfully!', 'success');
        this.loadingClockIn = false;
        this.loadTodayActivities();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock in', 'error');
        this.loadingClockIn = false;
        this.cdr.markForCheck();
      }
    });
  }

  clockOut(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loadingClockOut = true;
    this.cdr.markForCheck();
    
    this.attendanceService.clockOut(this.selectedEmployeeId).subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.showMessage('Clocked out successfully!', 'success');
        this.loadingClockOut = false;
        this.loadTodayActivities();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock out', 'error');
        this.loadingClockOut = false;
        this.cdr.markForCheck();
      }
    });
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.message = '';
      this.cdr.markForCheck();
    }, 5000);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatClockTime(time: string | undefined): string {
    if (!time) return '-';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  getEmployeeInitials(emp: Employee | any): string {
    if (emp?.firstName && emp?.lastName) {
      return `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase();
    }
    if (emp?.employee?.firstName && emp?.employee?.lastName) {
      return `${emp.employee.firstName.charAt(0)}${emp.employee.lastName.charAt(0)}`.toUpperCase();
    }
    return '??';
  }

  getEmployeeName(record: AttendanceRecord): string {
    if (record.employee) {
      return `${record.employee.firstName} ${record.employee.lastName}`;
    }
    const emp = this.employees.find(e => e.id === record.employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }

  isClockedIn(): boolean {
    return !!(this.todayRecord && this.todayRecord.clockIn && !this.todayRecord.clockOut);
  }

  isClockedOut(): boolean {
    return !!(this.todayRecord && this.todayRecord.clockOut);
  }

  quickClockOut(record: AttendanceRecord): void {
    if (!record.employeeId && !record.employee?.id) {
      this.showMessage('Cannot clock out - employee not found', 'error');
      return;
    }
    
    const employeeId = record.employeeId || record.employee?.id;
    this.loadingClockOut = true;
    this.cdr.markForCheck();
    
    this.attendanceService.clockOut(employeeId!).subscribe({
      next: (updatedRecord) => {
        this.showMessage(`${this.getEmployeeName(record)} clocked out successfully!`, 'success');
        this.loadingClockOut = false;
        this.loadTodayActivities();
        
        if (this.selectedEmployeeId === employeeId) {
          this.todayRecord = updatedRecord;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock out', 'error');
        this.loadingClockOut = false;
        this.cdr.markForCheck();
      }
    });
  }
}
