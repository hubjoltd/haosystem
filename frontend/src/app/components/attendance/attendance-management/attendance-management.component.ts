import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord, AttendanceRule, ProjectTimeEntry } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { ToastService } from '../../../services/toast.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceManagementComponent implements OnInit {
  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  attendanceRules: AttendanceRule[] = [];
  projectTimeEntries: ProjectTimeEntry[] = [];

  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedEmployeeId: number | null = null;
  filterStatus = '';
  searchTerm = '';
  loading = false;
  dataLoaded = false;

  showManualEntryModal = false;
  showBulkUploadModal = false;
  showRulesModal = false;
  showProjectTimeModal = false;

  manualEntry: any = {};
  bulkFile: File | null = null;
  newRule: AttendanceRule = this.getEmptyRule();
  newProjectTime: ProjectTimeEntry = this.getEmptyProjectTime();
  
  selectAll = false;
  approvingId: number | null = null;
  bulkApproving = false;
  
  showEditModal = false;
  editingRecord: AttendanceRecord | null = null;
  editForm = {
    clockIn: '',
    clockOut: '',
    status: 'PRESENT',
    remarks: '',
    calculatedHours: 0
  };

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.dataLoaded) return;
    this.loading = true;
    this.cdr.detectChanges();
    
    forkJoin({
      employees: this.employeeService.getAll(),
      records: this.attendanceService.getByDate(this.selectedDate)
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
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.toastService.error('Failed to load attendance data');
        this.cdr.detectChanges();
      }
    });
  }

  loadAttendanceRecords(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.attendanceService.getByDate(this.selectedDate).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.attendanceRecords = data;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading records:', err);
        this.toastService.error('Failed to load attendance records');
        this.cdr.detectChanges();
      }
    });
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.loadAttendanceRecords();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let records = this.attendanceRecords;
    if (this.filterStatus) {
      records = records.filter(r => r.status === this.filterStatus);
    }
    if (this.selectedEmployeeId) {
      records = records.filter(r => r.employee?.id === this.selectedEmployeeId);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      records = records.filter(r => {
        const name = this.getEmployeeName(r.employee).toLowerCase();
        return name.includes(term);
      });
    }
    this.filteredRecords = records;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  countWorking(): number {
    return this.attendanceRecords.filter(r => r.clockIn && !r.clockOut).length;
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getInitials(emp: any): string {
    if (!emp) return '??';
    const first = emp.firstName?.charAt(0) || '';
    const last = emp.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '??';
  }

  calculateHoursDisplay(record: AttendanceRecord): string {
    if (!record.clockIn || !record.clockOut) return '—';
    const totalHours = (record.regularHours || 0) + (record.overtimeHours || 0);
    if (totalHours > 0) return totalHours.toFixed(1);
    return '—';
  }

  getDisplayStatus(record: AttendanceRecord): string {
    if (record.clockIn && !record.clockOut) return 'Working';
    if (record.approvalStatus === 'PENDING') return 'Pending';
    if (record.approvalStatus === 'APPROVED') return 'Approved';
    return record.status || 'Present';
  }

  getStatusBadgeClass(record: AttendanceRecord): string {
    if (record.clockIn && !record.clockOut) return 'working';
    if (record.approvalStatus === 'PENDING') return 'pending';
    if (record.approvalStatus === 'APPROVED') return 'approved';
    return 'present';
  }

  openManualEntryModal(): void {
    this.manualEntry = this.getEmptyManualEntry();
    this.manualEntry.attendanceDate = this.selectedDate;
    this.showManualEntryModal = true;
  }

  closeManualEntryModal(): void {
    this.showManualEntryModal = false;
  }

  saveManualEntry(): void {
    if (!this.manualEntry.employeeId) {
      this.toastService.warning('Please select an employee');
      return;
    }

    const record: AttendanceRecord = {
      employeeId: this.manualEntry.employeeId,
      attendanceDate: this.manualEntry.attendanceDate,
      clockIn: this.manualEntry.clockIn,
      clockOut: this.manualEntry.clockOut,
      status: this.manualEntry.status || 'PRESENT',
      remarks: this.manualEntry.remarks
    };

    this.loading = true;
    this.attendanceService.manualEntry(record).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toastService.success('Manual entry saved successfully');
        this.closeManualEntryModal();
        this.loadAttendanceRecords();
      },
      error: (err) => {
        console.error('Error saving manual entry:', err);
        this.toastService.error('Failed to save manual entry');
      }
    });
  }

  getEmptyManualEntry(): any {
    return {
      employeeId: null,
      attendanceDate: '',
      clockIn: '',
      clockOut: '',
      status: 'PRESENT',
      remarks: ''
    };
  }

  countByStatus(status: string): number {
    return this.attendanceRecords.filter(r => r.status === status).length;
  }

  formatTime(time?: string): string {
    if (!time) return '—';
    return time.substring(0, 5);
  }

  getEmployeeName(emp: any): string {
    if (!emp) return 'Unknown';
    return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown';
  }

  getEmptyRule(): AttendanceRule {
    return {
      ruleName: '',
      description: '',
      standardStartTime: '09:00',
      standardEndTime: '17:00',
      regularHoursPerDay: 8,
      weeklyHoursLimit: 40,
      graceMinutesIn: 15,
      graceMinutesOut: 15,
      breakDurationMinutes: 60,
      autoDeductBreak: true,
      enableOvertime: true,
      overtimeMultiplier: 1.5,
      maxOvertimeHoursDaily: 4,
      maxOvertimeHoursWeekly: 20,
      halfDayEnabled: true,
      halfDayHours: 4,
      isActive: true,
      isDefault: false
    };
  }

  getEmptyProjectTime(): ProjectTimeEntry {
    return {
      employeeId: undefined,
      projectCode: '',
      projectName: '',
      entryDate: new Date().toISOString().split('T')[0],
      entryType: 'REGULAR',
      hoursWorked: 0,
      isPresent: true,
      taskDescription: '',
      status: 'DRAFT',
      remarks: '',
      billable: true,
      billableRate: 0
    };
  }

  toggleSelectAll(): void {
    this.filteredRecords.forEach(r => r.selected = this.selectAll);
    this.cdr.markForCheck();
  }

  getSelectedRecords(): AttendanceRecord[] {
    return this.filteredRecords.filter(r => r.selected && r.approvalStatus === 'PENDING');
  }

  approveRecord(record: AttendanceRecord): void {
    if (!record.id) return;
    this.approvingId = record.id;
    this.cdr.markForCheck();
    
    this.attendanceService.approve(record.id).subscribe({
      next: (updated) => {
        record.approvalStatus = 'APPROVED';
        record.approvedAt = updated.approvedAt;
        this.toastService.success('Attendance approved');
        this.approvingId = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(err.error?.error || 'Failed to approve');
        this.approvingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  rejectRecord(record: AttendanceRecord): void {
    if (!record.id) return;
    const remarks = prompt('Enter rejection reason (optional):');
    
    this.approvingId = record.id;
    this.cdr.markForCheck();
    
    this.attendanceService.reject(record.id, remarks || undefined).subscribe({
      next: (updated) => {
        record.approvalStatus = 'REJECTED';
        record.remarks = updated.remarks;
        this.toastService.success('Attendance rejected');
        this.approvingId = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(err.error?.error || 'Failed to reject');
        this.approvingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  bulkApprove(): void {
    const selected = this.getSelectedRecords();
    if (selected.length === 0) {
      this.toastService.warning('No pending records selected');
      return;
    }
    
    const ids = selected.map(r => r.id!).filter(id => id);
    this.bulkApproving = true;
    this.cdr.markForCheck();
    
    this.attendanceService.bulkApprove(ids).subscribe({
      next: (result) => {
        this.toastService.success(`${result.approved} record(s) approved`);
        selected.forEach(r => r.approvalStatus = 'APPROVED');
        this.selectAll = false;
        this.filteredRecords.forEach(r => r.selected = false);
        this.bulkApproving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(err.error?.error || 'Bulk approval failed');
        this.bulkApproving = false;
        this.cdr.markForCheck();
      }
    });
  }

  get paginatedRecords(): AttendanceRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredRecords.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.markForCheck();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxPages - 1);
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  calculateTotalHours(record: AttendanceRecord): string {
    const regular = record.regularHours || 0;
    const ot = record.overtimeHours || 0;
    return (regular + ot).toFixed(1);
  }

  openEditModal(record: AttendanceRecord): void {
    this.editingRecord = record;
    this.editForm = {
      clockIn: record.clockIn || '',
      clockOut: record.clockOut || '',
      status: record.status || 'PRESENT',
      remarks: record.remarks || '',
      calculatedHours: this.calculateHoursFromTimes(record.clockIn, record.clockOut)
    };
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingRecord = null;
    this.cdr.markForCheck();
  }

  onEditTimeChange(): void {
    this.editForm.calculatedHours = this.calculateHoursFromTimes(this.editForm.clockIn, this.editForm.clockOut);
    this.cdr.markForCheck();
  }

  calculateHoursFromTimes(clockIn?: string, clockOut?: string): number {
    if (!clockIn || !clockOut) return 0;
    const [inH, inM] = clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;
    if (outMinutes <= inMinutes) return 0;
    return Math.round((outMinutes - inMinutes) / 60 * 100) / 100;
  }

  saveEditRecord(): void {
    if (!this.editingRecord?.id) return;

    this.loading = true;
    this.cdr.markForCheck();

    const updateData = {
      clockIn: this.editForm.clockIn || null,
      clockOut: this.editForm.clockOut || null,
      status: this.editForm.status,
      remarks: this.editForm.remarks
    };

    this.attendanceService.update(this.editingRecord.id, updateData as any).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (updated) => {
        this.toastService.success('Attendance record updated successfully');
        this.closeEditModal();
        this.loadAttendanceRecords();
      },
      error: (err) => {
        this.toastService.error(err.error?.error || 'Failed to update record');
      }
    });
  }
}
