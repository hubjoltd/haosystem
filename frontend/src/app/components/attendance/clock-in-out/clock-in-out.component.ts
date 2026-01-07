import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { Employee } from '../../../services/employee.service';

@Component({
  selector: 'app-clock-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clock-in-out.component.html',
  styleUrls: ['./clock-in-out.component.scss']
})
export class ClockInOutComponent implements OnInit {
  currentTime: Date = new Date();
  todayRecord: AttendanceRecord | null = null;
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;
  selectedEmployee: Employee | null = null;
  loading = false;
  message = '';
  messageType = '';
  
  todayActivities: AttendanceRecord[] = [];

  constructor(
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    this.loadEmployees();
    this.loadTodayActivities();
  }

  loadEmployees(): void {
    this.attendanceService.getEmployeesForClock().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
      },
      error: (err: any) => console.error('Error loading employees:', err)
    });
  }

  loadTodayActivities(): void {
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService.getByDate(today).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.todayActivities = records.filter(r => r.clockIn || r.clockOut);
      },
      error: (err: any) => console.error('Error loading today activities:', err)
    });
  }

  onEmployeeChange(): void {
    if (this.selectedEmployeeId) {
      this.selectedEmployee = this.employees.find(e => e.id === this.selectedEmployeeId) || null;
      this.loadEmployeeTodayRecord();
    } else {
      this.selectedEmployee = null;
      this.todayRecord = null;
    }
  }

  loadEmployeeTodayRecord(): void {
    if (!this.selectedEmployeeId) return;
    
    const today = new Date().toISOString().split('T')[0];
    this.attendanceService.getByEmployeeAndDateRange(this.selectedEmployeeId, today, today).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.todayRecord = records.length > 0 ? records[0] : null;
      },
      error: () => {
        this.todayRecord = null;
      }
    });
  }

  clockIn(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loading = true;
    this.attendanceService.clockIn(this.selectedEmployeeId, 'WEB').subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.showMessage('Clocked in successfully!', 'success');
        this.loading = false;
        this.loadTodayActivities();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock in', 'error');
        this.loading = false;
      }
    });
  }

  clockOut(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loading = true;
    this.attendanceService.clockOut(this.selectedEmployeeId).subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.showMessage('Clocked out successfully!', 'success');
        this.loading = false;
        this.loadTodayActivities();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock out', 'error');
        this.loading = false;
      }
    });
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
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
}
