import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';

interface EmployeeRow {
  employee: Employee;
  record: AttendanceRecord | null;
  selected: boolean;
}

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
  selectedDate: string = '';
  selectedProject: string = 'all';
  searchQuery: string = '';

  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  employeeRows: EmployeeRow[] = [];
  filteredRows: EmployeeRow[] = [];

  loadingEmployees = true;
  loadingRecords = false;
  loadingClockIn = false;
  loadingClockOut = false;
  processingEmployeeId: number | null = null;

  message = '';
  messageType = '';

  showClockInModal = false;
  clockInEmployee: Employee | null = null;
  selectedLocation: string = 'ON_SITE';

  selectAll = false;

  clockInterval: any = null;
  refreshInterval: any = null;

  private avatarColors: string[] = [
    '#008080', '#e74c3c', '#3498db', '#9b59b6', '#e67e22',
    '#1abc9c', '#2ecc71', '#f39c12', '#d35400', '#c0392b',
    '#2980b9', '#8e44ad', '#27ae60', '#f1c40f', '#16a085',
    '#7f8c8d', '#34495e', '#e91e63', '#673ab7', '#ff5722'
  ];

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.selectedDate = this.toDateInputValue(now);

    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
      this.cdr.markForCheck();
    }, 1000);

    this.loadData();

    this.refreshInterval = setInterval(() => {
      this.loadAttendanceRecords();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private toDateInputValue(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get formattedDate(): string {
    if (!this.selectedDate) return '';
    const parts = this.selectedDate.split('-');
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }

  get dayName(): string {
    if (!this.selectedDate) return '';
    const d = new Date(this.selectedDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  loadData(): void {
    this.loadingEmployees = true;
    this.cdr.markForCheck();

    this.employeeService.getAll().subscribe({
      next: (data: Employee[]) => {
        this.employees = data.filter((e: Employee) => e.active);
        this.loadingEmployees = false;
        this.loadAttendanceRecords();
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingEmployees = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadAttendanceRecords(): void {
    if (!this.selectedDate) return;
    this.loadingRecords = true;
    this.cdr.markForCheck();

    this.attendanceService.getByDate(this.selectedDate).subscribe({
      next: (records: AttendanceRecord[]) => {
        this.attendanceRecords = records;
        this.mergeData();
        this.loadingRecords = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.attendanceRecords = [];
        this.mergeData();
        this.loadingRecords = false;
        this.cdr.markForCheck();
      }
    });
  }

  mergeData(): void {
    this.employeeRows = this.employees.map(emp => {
      const record = this.attendanceRecords.find(r =>
        r.employeeId === emp.id || r.employee?.id === emp.id
      ) || null;
      const existing = this.employeeRows.find(er => er.employee.id === emp.id);
      return {
        employee: emp,
        record,
        selected: existing ? existing.selected : false
      };
    });
    this.applyFilter();
  }

  onDateChange(): void {
    this.loadAttendanceRecords();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredRows = [...this.employeeRows];
    } else {
      this.filteredRows = this.employeeRows.filter(row => {
        const name = `${row.employee.firstName} ${row.employee.lastName}`.toLowerCase();
        const code = (row.employee.employeeCode || '').toLowerCase();
        return name.includes(q) || code.includes(q);
      });
    }
    this.cdr.markForCheck();
  }

  getStatus(row: EmployeeRow): string {
    if (!row.record || (!row.record.clockIn && !row.record.clockOut)) return 'not_clocked';
    if (row.record.clockIn && row.record.clockOut) return 'completed';
    if (row.record.clockIn && !row.record.clockOut) return 'clocked_in';
    return 'not_clocked';
  }

  getStatusLabel(row: EmployeeRow): string {
    const s = this.getStatus(row);
    if (s === 'completed') return 'Completed';
    if (s === 'clocked_in') return 'Clocked In';
    return 'Not Clocked';
  }

  isOnSite(row: EmployeeRow): boolean | null {
    if (!row.record || !row.record.captureMethod) return null;
    const method = row.record.captureMethod.toUpperCase();
    return method === 'ON_SITE' || method === 'ONSITE' || method === 'WEB' || method === 'BIOMETRIC';
  }

  getClockTime(time: string | undefined): string {
    if (!time) return '—';
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  getHours(row: EmployeeRow): string {
    if (!row.record) return '—';
    if (row.record.regularHours != null && row.record.regularHours > 0) {
      const total = row.record.regularHours + (row.record.overtimeHours || 0);
      if (total < 1) {
        return `${Math.round(total * 60)}m`;
      }
      return `${Math.round(total)}h`;
    }
    if (row.record.clockIn && row.record.clockOut) {
      const inParts = row.record.clockIn.split(':').map(Number);
      const outParts = row.record.clockOut.split(':').map(Number);
      const inMin = inParts[0] * 60 + inParts[1];
      const outMin = outParts[0] * 60 + outParts[1];
      const diff = outMin - inMin;
      if (diff <= 0) return '—';
      if (diff < 60) return `${diff}m`;
      return `${Math.round(diff / 60)}h`;
    }
    return '—';
  }

  getAvatarColor(emp: Employee): string {
    const name = `${emp.firstName}${emp.lastName}`;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  getInitials(emp: Employee): string {
    return `${(emp.firstName || '?').charAt(0)}${(emp.lastName || '?').charAt(0)}`.toUpperCase();
  }

  toggleSelectAll(): void {
    this.filteredRows.forEach(r => r.selected = this.selectAll);
    this.cdr.markForCheck();
  }

  onRowSelect(): void {
    this.selectAll = this.filteredRows.length > 0 && this.filteredRows.every(r => r.selected);
    this.cdr.markForCheck();
  }

  openClockInModal(emp: Employee): void {
    this.clockInEmployee = emp;
    this.selectedLocation = 'ON_SITE';
    this.showClockInModal = true;
    this.cdr.markForCheck();
  }

  cancelClockIn(): void {
    this.showClockInModal = false;
    this.clockInEmployee = null;
    this.cdr.markForCheck();
  }

  confirmClockIn(): void {
    if (!this.clockInEmployee?.id) return;
    this.loadingClockIn = true;
    this.processingEmployeeId = this.clockInEmployee.id;
    this.showClockInModal = false;
    this.cdr.markForCheck();

    this.attendanceService.clockIn(this.clockInEmployee.id, this.selectedLocation).subscribe({
      next: () => {
        this.showMessage(`${this.clockInEmployee?.firstName} ${this.clockInEmployee?.lastName} clocked in successfully!`, 'success');
        this.loadingClockIn = false;
        this.processingEmployeeId = null;
        this.clockInEmployee = null;
        this.loadAttendanceRecords();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock in', 'error');
        this.loadingClockIn = false;
        this.processingEmployeeId = null;
        this.cdr.markForCheck();
      }
    });
  }

  clockOut(emp: Employee): void {
    if (!emp.id) return;
    this.loadingClockOut = true;
    this.processingEmployeeId = emp.id;
    this.cdr.markForCheck();

    this.attendanceService.clockOut(emp.id).subscribe({
      next: () => {
        this.showMessage(`${emp.firstName} ${emp.lastName} clocked out successfully!`, 'success');
        this.loadingClockOut = false;
        this.processingEmployeeId = null;
        this.loadAttendanceRecords();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock out', 'error');
        this.loadingClockOut = false;
        this.processingEmployeeId = null;
        this.cdr.markForCheck();
      }
    });
  }

  isProcessing(empId: number | undefined): boolean {
    return empId != null && this.processingEmployeeId === empId;
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
}
