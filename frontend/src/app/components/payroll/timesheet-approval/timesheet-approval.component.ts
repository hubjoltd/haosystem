import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, Timesheet, PayFrequency } from '../../../services/payroll.service';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';

@Component({
  selector: 'app-timesheet-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet-approval.component.html',
  styleUrls: ['./timesheet-approval.component.scss']
})
export class TimesheetApprovalComponent implements OnInit {
  activeTab: 'attendance' | 'timesheet' = 'attendance';
  loading = false;
  message = '';
  messageType = '';

  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  timesheets: Timesheet[] = [];
  filteredTimesheets: Timesheet[] = [];
  payFrequencies: PayFrequency[] = [];

  selectedDate: string = '';
  weekEndingDate: string = '';
  payDate: string = '';
  approvedBy: string = 'HR Manager';

  filterStatus = 'ALL';
  statusOptions = ['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];

  totalEmployees = 0;
  totalHours = 0;
  totalOvertime = 0;

  showGenerateModal = false;
  generateStartDate = '';
  generateEndDate = '';
  generating = false;

  selectedTimesheetIds: number[] = [];
  selectedEmployee: any = null;

  constructor(
    private payrollService: PayrollService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadEmployees();
    this.loadPayFrequencies();
  }

  setDefaultDates(): void {
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];

    const dayOfWeek = today.getDay();
    const daysToSunday = 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysToSunday);
    this.weekEndingDate = sunday.toISOString().split('T')[0];

    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + (5 - dayOfWeek + 7) % 7 + 7);
    this.payDate = nextFriday.toISOString().split('T')[0];

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.generateStartDate = firstOfMonth.toISOString().split('T')[0];
    this.generateEndDate = lastOfMonth.toISOString().split('T')[0];
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data.filter(e => e.active);
        this.loadDailyAttendance();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  loadDailyAttendance(): void {
    this.loading = true;
    this.attendanceRecords = [];

    let completed = 0;
    const allRecords: AttendanceRecord[] = [];

    if (this.employees.length === 0) {
      this.loading = false;
      this.calculateDailySummary();
      return;
    }

    this.employees.forEach(emp => {
      this.attendanceService.getByEmployeeAndDateRange(emp.id!, this.selectedDate, this.selectedDate).subscribe({
        next: (records) => {
          records.forEach(r => {
            r.employee = emp;
          });
          allRecords.push(...records);
          completed++;
          if (completed === this.employees.length) {
            this.attendanceRecords = allRecords;
            this.calculateDailySummary();
            this.loading = false;
          }
        },
        error: () => {
          completed++;
          if (completed === this.employees.length) {
            this.attendanceRecords = allRecords;
            this.calculateDailySummary();
            this.loading = false;
          }
        }
      });
    });
  }

  calculateDailySummary(): void {
    this.totalEmployees = this.attendanceRecords.length;
    this.totalHours = this.attendanceRecords.reduce((sum, r) => sum + (r.regularHours || 0), 0);
    this.totalOvertime = this.attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
  }

  onDateChange(): void {
    this.loadDailyAttendance();
  }

  loadPayFrequencies(): void {
    this.payrollService.getPayFrequencies().subscribe({
      next: (data) => this.payFrequencies = data,
      error: (err) => console.error('Error loading pay frequencies:', err)
    });
  }

  loadTimesheets(): void {
    this.loading = true;
    this.payrollService.getTimesheets().subscribe({
      next: (data) => {
        this.timesheets = data;
        this.filterTimesheets();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading timesheets:', err);
        this.loading = false;
      }
    });
  }

  filterTimesheets(): void {
    this.filteredTimesheets = this.timesheets.filter(t => {
      return this.filterStatus === 'ALL' || t.status === this.filterStatus;
    });
  }

  switchTab(tab: 'attendance' | 'timesheet'): void {
    this.activeTab = tab;
    if (tab === 'timesheet' && this.timesheets.length === 0) {
      this.loadTimesheets();
    }
  }

  openGenerateModal(): void {
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
  }

  generateTimesheets(): void {
    if (!this.generateStartDate || !this.generateEndDate) return;

    this.generating = true;
    this.payrollService.generateTimesheets(this.generateStartDate, this.generateEndDate).subscribe({
      next: (result) => {
        this.generating = false;
        this.closeGenerateModal();
        this.loadTimesheets();
        this.showMessage(`Generated ${result.generated} timesheets successfully`, 'success');
      },
      error: (err) => {
        this.generating = false;
        console.error('Error generating timesheets:', err);
        this.showMessage('Error generating timesheets', 'error');
      }
    });
  }

  toggleTimesheetSelection(id: number): void {
    const idx = this.selectedTimesheetIds.indexOf(id);
    if (idx > -1) {
      this.selectedTimesheetIds.splice(idx, 1);
    } else {
      this.selectedTimesheetIds.push(id);
    }
  }

  isTimesheetSelected(id: number): boolean {
    return this.selectedTimesheetIds.includes(id);
  }

  getPendingTimesheets(): Timesheet[] {
    return this.filteredTimesheets.filter(t => t.status === 'PENDING_APPROVAL');
  }

  areAllPendingSelected(): boolean {
    const pending = this.getPendingTimesheets();
    if (pending.length === 0) return false;
    return pending.every(t => this.selectedTimesheetIds.includes(t.id!));
  }

  selectAllTimesheets(): void {
    if (this.areAllPendingSelected()) {
      this.selectedTimesheetIds = [];
    } else {
      this.selectedTimesheetIds = this.getPendingTimesheets().map(t => t.id!);
    }
  }

  approveTimesheet(id: number): void {
    this.payrollService.approveTimesheet(id, {}).subscribe({
      next: () => {
        this.loadTimesheets();
        this.showMessage('Timesheet approved', 'success');
      },
      error: (err) => {
        console.error('Error approving timesheet:', err);
        this.showMessage('Error approving timesheet', 'error');
      }
    });
  }

  approveSelectedTimesheets(): void {
    if (this.selectedTimesheetIds.length === 0) {
      this.showMessage('Please select at least one timesheet', 'error');
      return;
    }

    let completed = 0;
    let errors = 0;
    const total = this.selectedTimesheetIds.length;

    this.selectedTimesheetIds.forEach(id => {
      this.payrollService.approveTimesheet(id, {}).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.selectedTimesheetIds = [];
            this.loadTimesheets();
            if (errors === 0) {
              this.showMessage(`Approved ${total} timesheets successfully`, 'success');
            } else {
              this.showMessage(`Approved ${total - errors} timesheets, ${errors} failed`, 'warning');
            }
          }
        },
        error: () => {
          completed++;
          errors++;
          if (completed === total) {
            this.selectedTimesheetIds = [];
            this.loadTimesheets();
            this.showMessage(`Approved ${total - errors} timesheets, ${errors} failed`, 'warning');
          }
        }
      });
    });
  }

  rejectTimesheet(id: number): void {
    const remarks = prompt('Enter rejection reason:');
    if (remarks === null) return;

    this.payrollService.rejectTimesheet(id, { approverRemarks: remarks }).subscribe({
      next: () => {
        this.loadTimesheets();
        this.showMessage('Timesheet rejected', 'success');
      },
      error: (err) => {
        console.error('Error rejecting timesheet:', err);
        this.showMessage('Error rejecting timesheet', 'error');
      }
    });
  }

  selectEmployee(ts: Timesheet): void {
    this.selectedEmployee = {
      empId: ts.employee?.employeeCode || `EMP${ts.employeeId}`,
      name: this.getEmployeeName(ts),
      status: ts.status
    };
  }

  getEmployeeName(ts: Timesheet): string {
    if (ts.employee) {
      return `${ts.employee.firstName || ''} ${ts.employee.lastName || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING_APPROVAL': return 'pending';
      case 'PRESENT': return 'present';
      case 'ABSENT': return 'absent';
      case 'ON_LEAVE': return 'on-leave';
      case 'HALF_DAY': return 'half-day';
      case 'WEEKEND': return 'weekend';
      default: return 'draft';
    }
  }

  getCountByStatus(status: string): number {
    return this.timesheets.filter(t => t.status === status).length;
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 4000);
  }
}
