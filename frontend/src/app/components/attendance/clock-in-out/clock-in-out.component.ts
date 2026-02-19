import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  editingRowId: number | null = null;
  editClockIn: string = '';
  editClockOut: string = '';
  editLocationType: string = 'ON_SITE';
  savingEdit = false;
  showEditModal = false;
  editEmployee: EmployeeRow | null = null;

  clockInterval: any = null;
  refreshInterval: any = null;

  private avatarColors: string[] = [
    '#008080', '#e74c3c', '#3498db', '#9b59b6', '#e67e22',
    '#1abc9c', '#2ecc71', '#f39c12', '#d35400', '#c0392b',
    '#2980b9', '#8e44ad', '#27ae60', '#f1c40f', '#16a085',
    '#7f8c8d', '#34495e', '#e91e63', '#673ab7', '#ff5722'
  ];

  projectList: Project[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
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
    this.projectService.getAll().subscribe(projects => {
      this.projectList = projects;
      this.cdr.markForCheck();
    });

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
    const loc = row.record?.locationType || row.record?.captureMethod;
    if (!loc) return null;
    const method = loc.toUpperCase();
    return method === 'ON_SITE' || method === 'ONSITE' || method === 'WEB' || method === 'BIOMETRIC';
  }

  getClockTime(time: string | undefined): string {
    if (!time) return '—';
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  private getRawMinutes(row: EmployeeRow): number {
    if (!row.record) return 0;
    if (row.record.regularHours != null && row.record.regularHours > 0) {
      return Math.round((row.record.regularHours + (row.record.overtimeHours || 0)) * 60);
    }
    if (row.record.clockIn && row.record.clockOut) {
      const inParts = row.record.clockIn.split(':').map(Number);
      const outParts = row.record.clockOut.split(':').map(Number);
      const inMin = inParts[0] * 60 + inParts[1];
      const outMin = outParts[0] * 60 + outParts[1];
      return outMin - inMin;
    }
    return 0;
  }

  getLunchHour(row: EmployeeRow): string {
    const rawMin = this.getRawMinutes(row);
    if (rawMin > 480) {
      return '1h';
    }
    return '—';
  }

  getHours(row: EmployeeRow): string {
    const rawMin = this.getRawMinutes(row);
    if (rawMin <= 0) return '—';
    let netMin = rawMin;
    if (rawMin > 480) {
      netMin = rawMin - 60;
    }
    if (netMin < 60) return `${netMin}m`;
    const hrs = Math.floor(netMin / 60);
    const mins = netMin % 60;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
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

    this.attendanceService.clockIn(this.clockInEmployee.id, this.selectedLocation, this.selectedDate).subscribe({
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

    this.attendanceService.clockOut(emp.id, this.selectedDate).subscribe({
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

  openEditModal(row: EmployeeRow): void {
    if (!row.record) return;
    this.editEmployee = row;
    this.editClockIn = row.record.clockIn ? row.record.clockIn.substring(0, 5) : '';
    this.editClockOut = row.record.clockOut ? row.record.clockOut.substring(0, 5) : '';
    this.editLocationType = row.record.locationType || row.record.captureMethod || 'ON_SITE';
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.showEditModal = false;
    this.editEmployee = null;
    this.editClockIn = '';
    this.editClockOut = '';
    this.editLocationType = 'ON_SITE';
    this.cdr.markForCheck();
  }

  saveEdit(): void {
    if (!this.editEmployee?.record?.id) return;
    this.savingEdit = true;
    this.cdr.markForCheck();

    const updatedRecord: any = {
      clockIn: this.editClockIn ? this.editClockIn + ':00' : this.editEmployee.record.clockIn,
      clockOut: this.editClockOut ? this.editClockOut + ':00' : this.editEmployee.record.clockOut,
      status: this.editEmployee.record.status,
      remarks: this.editEmployee.record.remarks,
      locationType: this.editLocationType
    };

    this.attendanceService.update(this.editEmployee.record.id, updatedRecord).subscribe({
      next: () => {
        this.showMessage('Attendance updated successfully', 'success');
        this.savingEdit = false;
        this.showEditModal = false;
        this.editEmployee = null;
        this.loadAttendanceRecords();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to update', 'error');
        this.savingEdit = false;
        this.cdr.markForCheck();
      }
    });
  }

  hasSelectedRows(): boolean {
    return this.filteredRows.some(r => r.selected);
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

  downloadPDF(): void {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(0, 128, 128);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Clock In / Clock Out Report', 14, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${this.formattedDate} (${this.dayName})`, 14, 20);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 18, { align: 'right' });

    const tableData = this.filteredRows.map(row => [
      row.employee.employeeCode || '-',
      `${row.employee.firstName} ${row.employee.lastName}`,
      row.employee.designation?.title || row.employee.jobRole?.title || '-',
      row.employee.department?.name || '-',
      this.getStatusLabel(row),
      this.getClockTime(row.record?.clockIn),
      this.getClockTime(row.record?.clockOut),
      this.getLunchHour(row),
      this.getHours(row)
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['EMP ID', 'Employee', 'Position', 'Department', 'Status', 'Clock In', 'Clock Out', 'Lunch', 'Hours']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 100, 100], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 253, 250] },
      columnStyles: {
        0: { cellWidth: 25 },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    const totalEmployees = this.filteredRows.length;
    const clockedIn = this.filteredRows.filter(r => this.getStatus(r) === 'clocked_in').length;
    const completed = this.filteredRows.filter(r => this.getStatus(r) === 'completed').length;
    const notClocked = this.filteredRows.filter(r => this.getStatus(r) === 'not_clocked').length;

    const finalY = (doc as any).lastAutoTable?.finalY || 60;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Summary: ${totalEmployees} Total | ${completed} Completed | ${clockedIn} Clocked In | ${notClocked} Not Clocked`, 14, finalY + 10);

    doc.save(`attendance_${this.selectedDate}.pdf`);
  }
}
