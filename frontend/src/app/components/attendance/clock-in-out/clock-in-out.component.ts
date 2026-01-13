import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';

@Component({
  selector: 'app-clock-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clock-in-out.component.html',
  styleUrls: ['./clock-in-out.component.scss']
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
  
  elapsedTime: string = '00:00:00';
  elapsedSeconds: number = 0;
  currentEarnings: number = 0;
  timerInterval: any = null;
  clockInterval: any = null;
  refreshInterval: any = null;
  
  lastSessionHours: number = 0;
  lastSessionEarnings: number = 0;
  showSessionSummary: boolean = false;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    this.loadEmployees();
    this.loadTodayActivities();
    
    this.refreshInterval = setInterval(() => {
      this.loadTodayActivities();
    }, 30000);
  }
  
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.employeeService.getAll().subscribe({
      next: (data: Employee[]) => {
        this.ngZone.run(() => {
          this.employees = data.filter((e: Employee) => e.active);
          if (this.employees.length > 0 && !this.selectedEmployeeId) {
            this.selectedEmployeeId = this.employees[0].id!;
            this.selectedEmployee = this.employees[0];
            this.loadEmployeeTodayRecord();
          }
          this.loadingEmployees = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Error loading employees:', err);
        this.loadingEmployees = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTodayActivities(): void {
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService.getByDate(today).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.ngZone.run(() => {
          this.todayActivities = records.filter(r => r.clockIn || r.clockOut);
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => console.error('Error loading today activities:', err)
    });
  }

  onEmployeeChange(): void {
    this.showSessionSummary = false;
    
    if (this.selectedEmployeeId) {
      this.selectedEmployee = this.employees.find(e => e.id === this.selectedEmployeeId) || null;
      this.stopTimer();
      this.todayRecord = null;
      this.loadEmployeeTodayRecord();
    } else {
      this.stopTimer();
      this.selectedEmployee = null;
      this.todayRecord = null;
    }
  }

  loadEmployeeTodayRecord(): void {
    if (!this.selectedEmployeeId) return;
    
    this.loadingRecord = true;
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService.getByEmployeeAndDateRange(this.selectedEmployeeId, today, today).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.ngZone.run(() => {
          this.todayRecord = records.length > 0 ? records[0] : null;
          this.loadingRecord = false;
          if (this.todayRecord && this.todayRecord.clockIn && !this.todayRecord.clockOut) {
            this.startTimerFromClockIn(this.todayRecord.clockIn);
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.todayRecord = null;
        this.loadingRecord = false;
        this.cdr.detectChanges();
      }
    });
  }

  startTimerFromClockIn(clockInTime: string): void {
    const today = new Date().toISOString().split('T')[0];
    const clockInDate = new Date(`${today}T${clockInTime}`);
    const now = new Date();
    
    this.elapsedSeconds = Math.floor((now.getTime() - clockInDate.getTime()) / 1000);
    this.updateElapsedDisplay();
    this.startTimer();
  }

  startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.updateElapsedDisplay();
      this.calculateCurrentEarnings();
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.elapsedTime = '00:00:00';
    this.elapsedSeconds = 0;
    this.currentEarnings = 0;
  }

  updateElapsedDisplay(): void {
    const hours = Math.floor(this.elapsedSeconds / 3600);
    const minutes = Math.floor((this.elapsedSeconds % 3600) / 60);
    const seconds = this.elapsedSeconds % 60;
    
    this.elapsedTime = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  calculateCurrentEarnings(): void {
    if (this.selectedEmployee) {
      const hourlyRate = this.selectedEmployee.hourlyRate || 0;
      const hoursWorked = this.elapsedSeconds / 3600;
      this.currentEarnings = hoursWorked * hourlyRate;
    }
  }

  getHourlyRate(): number {
    return this.selectedEmployee?.hourlyRate || 0;
  }

  clockIn(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loadingClockIn = true;
    this.showSessionSummary = false;
    
    this.attendanceService.clockIn(this.selectedEmployeeId, 'WEB').subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.showMessage('Clocked in successfully! Timer started.', 'success');
        this.loadingClockIn = false;
        this.loadTodayActivities();
        
        if (record.clockIn) {
          this.startTimerFromClockIn(record.clockIn);
        } else {
          this.elapsedSeconds = 0;
          this.currentEarnings = 0;
          this.startTimer();
        }
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock in', 'error');
        this.loadingClockIn = false;
      }
    });
  }

  clockOut(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loadingClockOut = true;
    
    const hoursWorked = this.elapsedSeconds / 3600;
    const earnings = hoursWorked * this.getHourlyRate();
    
    this.attendanceService.clockOut(this.selectedEmployeeId).subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.stopTimer();
        
        this.lastSessionHours = hoursWorked;
        this.lastSessionEarnings = earnings;
        this.showSessionSummary = true;
        
        this.showMessage(`Clocked out! Worked ${this.formatHoursMinutes(hoursWorked)} | Earned $${earnings.toFixed(2)}`, 'success');
        this.loadingClockOut = false;
        this.loadTodayActivities();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock out', 'error');
        this.loadingClockOut = false;
      }
    });
  }

  formatHoursMinutes(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    return `${h}h ${m}m`;
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

  getActivityStatus(record: AttendanceRecord): string {
    if (record.clockIn && record.clockOut) return 'Completed';
    if (record.clockIn && !record.clockOut) return 'Working';
    return 'Pending';
  }

  calculateDuration(record: AttendanceRecord): string {
    if (!record.clockIn || !record.clockOut) return '-';
    const hours = (record.regularHours || 0) + (record.overtimeHours || 0);
    if (hours > 0) return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}min`;
    return '-';
  }
  
  calculateEarnings(record: AttendanceRecord): number {
    if (!record.clockIn || !record.clockOut) return 0;
    const hours = (record.regularHours || 0) + (record.overtimeHours || 0);
    const emp = this.employees.find(e => e.id === record.employeeId);
    const hourlyRate = emp?.hourlyRate || 0;
    return hours * hourlyRate;
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
    
    this.attendanceService.clockOut(employeeId!).subscribe({
      next: (updatedRecord) => {
        this.showMessage(`${this.getEmployeeName(record)} clocked out successfully!`, 'success');
        this.loadingClockOut = false;
        this.loadTodayActivities();
        
        if (this.selectedEmployeeId === employeeId) {
          this.todayRecord = updatedRecord;
          this.stopTimer();
          
          const hoursWorked = this.elapsedSeconds / 3600;
          const earnings = hoursWorked * this.getHourlyRate();
          this.lastSessionHours = hoursWorked;
          this.lastSessionEarnings = earnings;
          this.showSessionSummary = true;
        }
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock out', 'error');
        this.loadingClockOut = false;
      }
    });
  }
}
