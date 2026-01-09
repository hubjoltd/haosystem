import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { PayrollService } from '../../../services/payroll.service';
import { ToastService } from '../../../services/toast.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-attendance-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-approval.component.html',
  styleUrls: ['./attendance-approval.component.scss']
})
export class AttendanceApprovalComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  employees: Employee[] = [];
  loading = true;

  selectedIds: number[] = [];
  filterStatus = 'PENDING';
  searchTerm = '';

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private payrollService: PayrollService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      employees: this.employeeService.getAll(),
      records: this.attendanceService.getAllRecords()
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.employees = data.employees;
        this.attendanceRecords = data.records;
        this.filterRecords();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.toastService.error('Failed to load attendance records');
      }
    });
  }

  filterRecords(): void {
    let records = [...this.attendanceRecords];

    if (this.filterStatus) {
      records = records.filter(r => r.approvalStatus === this.filterStatus);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      records = records.filter(r => {
        const name = this.getEmployeeName(r.employee).toLowerCase();
        return name.includes(term);
      });
    }

    this.filteredRecords = records;
  }

  onFilterChange(): void {
    this.selectedIds = [];
    this.filterRecords();
  }

  getPendingCount(): number {
    return this.attendanceRecords.filter(r => r.approvalStatus === 'PENDING').length;
  }

  toggleSelect(id: number): void {
    const idx = this.selectedIds.indexOf(id);
    if (idx > -1) {
      this.selectedIds.splice(idx, 1);
    } else {
      this.selectedIds.push(id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleSelectAll(): void {
    if (this.selectedIds.length === this.filteredRecords.length) {
      this.selectedIds = [];
    } else {
      this.selectedIds = this.filteredRecords.map(r => r.id!);
    }
  }

  isAllSelected(): boolean {
    return this.filteredRecords.length > 0 && this.selectedIds.length === this.filteredRecords.length;
  }

  approveRecord(id: number): void {
    this.loading = true;
    this.attendanceService.approve(id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toastService.success('Attendance approved successfully');
        this.loadData();
        this.generateTimesheetForRecord(id);
      },
      error: (err) => {
        console.error('Error approving:', err);
        this.toastService.error('Failed to approve attendance');
      }
    });
  }

  rejectRecord(id: number): void {
    const remarks = prompt('Enter rejection reason:');
    if (remarks === null) return;

    this.loading = true;
    this.attendanceService.reject(id, remarks).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toastService.success('Attendance rejected');
        this.loadData();
      },
      error: (err) => {
        console.error('Error rejecting:', err);
        this.toastService.error('Failed to reject attendance');
      }
    });
  }

  approveSelected(): void {
    if (this.selectedIds.length === 0) return;

    this.loading = true;
    this.attendanceService.bulkApprove(this.selectedIds).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toastService.success(`Approved ${this.selectedIds.length} attendance records`);
        this.generateTimesheetsForApproved(this.selectedIds);
        this.selectedIds = [];
        this.loadData();
      },
      error: (err) => {
        console.error('Error bulk approving:', err);
        this.toastService.error('Failed to approve attendance records');
      }
    });
  }

  rejectSelected(): void {
    if (this.selectedIds.length === 0) return;

    const remarks = prompt('Enter rejection reason for selected records:');
    if (remarks === null) return;

    this.loading = true;
    let completed = 0;
    let errors = 0;
    const total = this.selectedIds.length;

    this.selectedIds.forEach(id => {
      this.attendanceService.reject(id, remarks).subscribe({
        next: () => {
          completed++;
          this.checkBulkComplete(completed, errors, total);
        },
        error: () => {
          errors++;
          this.checkBulkComplete(completed, errors, total);
        }
      });
    });
  }

  checkBulkComplete(completed: number, errors: number, total: number): void {
    if (completed + errors === total) {
      this.loading = false;
      this.selectedIds = [];
      this.loadData();
      if (errors === 0) {
        this.toastService.success(`Rejected ${total} records successfully`);
      } else {
        this.toastService.warning(`Rejected ${completed} records, ${errors} failed`);
      }
    }
  }

  generateTimesheetForRecord(attendanceId: number): void {
    const record = this.attendanceRecords.find(r => r.id === attendanceId);
    if (record && record.employeeId) {
      this.triggerTimesheetGeneration([record.employeeId]);
    }
  }

  generateTimesheetsForApproved(attendanceIds: number[]): void {
    const employeeIds = [...new Set(
      this.attendanceRecords
        .filter(r => attendanceIds.includes(r.id!) && r.employeeId)
        .map(r => r.employeeId!)
    )];
    
    if (employeeIds.length > 0) {
      this.triggerTimesheetGeneration(employeeIds);
    }
  }

  triggerTimesheetGeneration(employeeIds: number[]): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSunday = 7 - dayOfWeek;
    const weekEnding = new Date(today);
    weekEnding.setDate(today.getDate() + daysToSunday);
    const weekEndingDate = weekEnding.toISOString().split('T')[0];
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const startDate = startOfWeek.toISOString().split('T')[0];

    this.payrollService.generateTimesheetsFromAttendance({ 
      employeeIds, 
      startDate,
      endDate: weekEndingDate 
    }).subscribe({
      next: (result) => {
        console.log('Timesheets auto-generated:', result);
        this.toastService.success('Timesheets generated automatically');
      },
      error: (err) => {
        console.error('Error auto-generating timesheets:', err);
      }
    });
  }

  getEmployeeName(emp: any): string {
    if (!emp) return 'Unknown';
    return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown';
  }

  getEmployeeInitials(emp: any): string {
    if (!emp) return '??';
    return `${(emp.firstName || '?').charAt(0)}${(emp.lastName || '?').charAt(0)}`.toUpperCase();
  }

  formatTime(clockIn?: string, clockOut?: string): string {
    if (!clockIn) return '-';
    return `${clockIn} - ${clockOut || '-'}`;
  }

  formatTimeRange(clockIn?: string, clockOut?: string): string {
    if (!clockIn) return '—';
    const inTime = clockIn.substring(0, 5);
    const outTime = clockOut ? clockOut.substring(0, 5) : '—';
    return `${inTime} - ${outTime}`;
  }

  formatStatus(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  calculateHours(record: AttendanceRecord): string {
    const total = (record.regularHours || 0) + (record.overtimeHours || 0);
    if (total > 0) return total.toFixed(2);
    return '—';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'rejected';
      default: return '';
    }
  }
}
