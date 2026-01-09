import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { PayrollService } from '../../../services/payroll.service';

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
  loading = false;
  message = '';
  messageType = '';

  selectedIds: number[] = [];
  filterStatus = 'PENDING';
  searchTerm = '';

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAttendanceRecords();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  loadAttendanceRecords(): void {
    this.loading = true;
    this.attendanceService.getAllRecords().subscribe({
      next: (data: AttendanceRecord[]) => {
        this.attendanceRecords = data;
        this.filterRecords();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading attendance:', err);
        this.loading = false;
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
    this.attendanceService.approve(id).subscribe({
      next: () => {
        this.showMessage('Attendance approved successfully', 'success');
        this.loadAttendanceRecords();
        this.generateTimesheetForRecord(id);
      },
      error: (err) => {
        console.error('Error approving:', err);
        this.showMessage('Error approving attendance', 'error');
        this.loading = false;
      }
    });
  }

  rejectRecord(id: number): void {
    const remarks = prompt('Enter rejection reason:');
    if (remarks === null) return;

    this.loading = true;
    this.attendanceService.reject(id, remarks).subscribe({
      next: () => {
        this.showMessage('Attendance rejected', 'success');
        this.loadAttendanceRecords();
      },
      error: (err) => {
        console.error('Error rejecting:', err);
        this.showMessage('Error rejecting attendance', 'error');
        this.loading = false;
      }
    });
  }

  approveSelected(): void {
    if (this.selectedIds.length === 0) return;

    this.loading = true;
    this.attendanceService.bulkApprove(this.selectedIds).subscribe({
      next: () => {
        this.showMessage(`Approved ${this.selectedIds.length} attendance records`, 'success');
        this.generateTimesheetsForApproved(this.selectedIds);
        this.selectedIds = [];
        this.loadAttendanceRecords();
      },
      error: (err) => {
        console.error('Error bulk approving:', err);
        this.showMessage('Error approving attendance records', 'error');
        this.loading = false;
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

    this.selectedIds.forEach(id => {
      this.attendanceService.reject(id, remarks).subscribe({
        next: () => {
          completed++;
          this.checkBulkComplete(completed, errors, this.selectedIds.length, 'rejected');
        },
        error: () => {
          errors++;
          this.checkBulkComplete(completed, errors, this.selectedIds.length, 'rejected');
        }
      });
    });
  }

  checkBulkComplete(completed: number, errors: number, total: number, action: string): void {
    if (completed + errors === total) {
      this.loading = false;
      this.selectedIds = [];
      this.loadAttendanceRecords();
      if (errors === 0) {
        this.showMessage(`${action} ${total} records successfully`, 'success');
      } else {
        this.showMessage(`${action} ${completed} records, ${errors} failed`, 'warning');
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
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  calculateHours(record: AttendanceRecord): string {
    const total = (record.regularHours || 0) + (record.overtimeHours || 0);
    if (total > 0) return total.toFixed(2);
    return '-';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'rejected';
      default: return '';
    }
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 4000);
  }
}
