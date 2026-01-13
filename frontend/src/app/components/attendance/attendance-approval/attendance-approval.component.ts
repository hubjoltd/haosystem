import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { PayrollService } from '../../../services/payroll.service';
import { ToastService } from '../../../services/toast.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-attendance-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './attendance-approval.component.html',
  styleUrls: ['./attendance-approval.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceApprovalComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  employees: Employee[] = [];
  loading = false;
  dataLoaded = false;

  selectedIds: number[] = [];
  filterStatus = 'PENDING';
  searchTerm = '';

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private payrollService: PayrollService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(forceReload: boolean = false): void {
    if (this.dataLoaded && !forceReload) return;
    this.loading = true;
    this.cdr.detectChanges();
    
    forkJoin({
      employees: this.employeeService.getAll(),
      records: this.attendanceService.getAllRecords()
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.employees = data.employees;
        this.attendanceRecords = data.records;
        this.filterRecords();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.toastService.error('Failed to load attendance records');
        this.cdr.detectChanges();
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
        const name = this.getEmployeeName(r).toLowerCase();
        const dept = this.getDepartmentName(r).toLowerCase();
        return name.includes(term) || dept.includes(term);
      });
    }

    this.filteredRecords = records;
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
    
    this.attendanceService.approve(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.toastService.success('Attendance approved successfully');
        this.dataLoaded = false;
        this.loadData(true);
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
    this.cdr.detectChanges();
    
    this.attendanceService.reject(id, remarks).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.toastService.success('Attendance rejected');
        this.dataLoaded = false;
        this.loadData(true);
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
    this.cdr.detectChanges();
    
    this.attendanceService.bulkApprove(this.selectedIds).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(`Approved ${this.selectedIds.length} attendance records`);
        this.generateTimesheetsForApproved(this.selectedIds);
        this.selectedIds = [];
        this.dataLoaded = false;
        this.loadData(true);
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
      this.dataLoaded = false;
      this.loadData(true);
      if (errors === 0) {
        this.toastService.success(`Rejected ${total} records successfully`);
      } else {
        this.toastService.warning(`Rejected ${completed} records, ${errors} failed`);
      }
      this.cdr.detectChanges();
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

  getEmployeeName(record: AttendanceRecord): string {
    if (record.employee?.firstName || record.employee?.lastName) {
      return `${record.employee.firstName || ''} ${record.employee.lastName || ''}`.trim();
    }
    if (record.employeeId) {
      const emp = this.employees.find(e => e.id === record.employeeId);
      if (emp) {
        return `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      }
    }
    return 'Unknown';
  }

  getDepartmentName(record: AttendanceRecord): string {
    if (record.employee?.department?.name) {
      return record.employee.department.name;
    }
    if (record.employeeId) {
      const emp = this.employees.find(e => e.id === record.employeeId);
      if (emp?.department?.name) {
        return emp.department.name;
      }
    }
    return '-';
  }

  getEmployeeInitials(record: AttendanceRecord): string {
    const name = this.getEmployeeName(record);
    if (name === 'Unknown') return '??';
    const parts = name.split(' ');
    return `${(parts[0] || '?').charAt(0)}${(parts[1] || '?').charAt(0)}`.toUpperCase();
  }

  formatTime(time?: string): string {
    if (!time) return '-';
    return time.substring(0, 5);
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
