import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceRecord, AttendanceRule, ProjectTimeEntry } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss']
})
export class AttendanceManagementComponent implements OnInit {
  activeTab = 'daily';
  loading = false;
  message = '';
  messageType = '';

  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  attendanceRules: AttendanceRule[] = [];
  projectTimeEntries: ProjectTimeEntry[] = [];

  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedEmployeeId: number | null = null;
  filterStatus = '';

  showManualEntryModal = false;
  showBulkUploadModal = false;
  showRulesModal = false;
  showProjectTimeModal = false;
  showDirectEntryModal = false;

  manualEntry: AttendanceRecord = this.getEmptyManualEntry();
  bulkEntries: any[] = [];
  bulkUploadText = '';
  bulkUploadMode: 'file' | 'paste' = 'file';
  selectedFileName = '';
  selectedFile: File | null = null;
  isDragOver = false;
  
  newRule: AttendanceRule = this.getEmptyRule();
  editingRule: AttendanceRule | null = null;

  projectEntry: ProjectTimeEntry = this.getEmptyProjectEntry();

  directEntryEmployees: number[] = [];
  directEntryStatus = 'PRESENT';
  directEntryDate = new Date().toISOString().split('T')[0];

  captureMethodOptions = [
    { value: 'WEB', label: 'Web Portal' },
    { value: 'MOBILE', label: 'Mobile App' },
    { value: 'BIOMETRIC', label: 'Biometric' },
    { value: 'MANUAL', label: 'Manual Entry' },
    { value: 'EXCEL_UPLOAD', label: 'Excel Upload' }
  ];

  statusOptions = [
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'HALF_DAY', label: 'Half Day' },
    { value: 'ON_LEAVE', label: 'On Leave' },
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'WEEKEND', label: 'Weekend' }
  ];

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAttendanceRecords();
    this.loadAttendanceRules();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data: Employee[]) => this.employees = data.filter((e: Employee) => e.active),
      error: (err: any) => console.error('Error loading employees:', err)
    });
  }

  loadAttendanceRecords(): void {
    this.loading = false;
    this.attendanceService.getByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.attendanceRecords = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading attendance:', err);
        this.loading = false;
      }
    });
  }

  loadAttendanceRules(): void {
    this.attendanceService.getAllRules().subscribe({
      next: (data) => this.attendanceRules = data,
      error: (err) => console.error('Error loading rules:', err)
    });
  }

  loadProjectTimeEntries(): void {
    this.attendanceService.getAllProjectTimeEntries().subscribe({
      next: (data) => this.projectTimeEntries = data,
      error: (err) => console.error('Error loading project time entries:', err)
    });
  }

  onDateChange(): void {
    this.loadAttendanceRecords();
  }

  getFilteredRecords(): AttendanceRecord[] {
    let records = this.attendanceRecords;
    if (this.filterStatus) {
      records = records.filter(r => r.status === this.filterStatus);
    }
    if (this.selectedEmployeeId) {
      records = records.filter(r => r.employee?.id === this.selectedEmployeeId);
    }
    return records;
  }

  openManualEntryModal(): void {
    this.manualEntry = this.getEmptyManualEntry();
    this.manualEntry.attendanceDate = this.selectedDate;
    this.showManualEntryModal = true;
  }

  closeManualEntryModal(): void {
    this.showManualEntryModal = false;
  }

  getEmptyManualEntry(): AttendanceRecord {
    return {
      attendanceDate: new Date().toISOString().split('T')[0],
      clockIn: '09:00',
      clockOut: '18:00',
      status: 'PRESENT',
      captureMethod: 'MANUAL',
      regularHours: 8,
      overtimeHours: 0,
      breakDuration: 1,
      remarks: ''
    };
  }

  saveManualEntry(): void {
    if (!this.manualEntry.employeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }

    this.loading = false;
    this.attendanceService.manualEntry(this.manualEntry).subscribe({
      next: () => {
        this.showMessage('Attendance saved successfully', 'success');
        this.closeManualEntryModal();
        this.loadAttendanceRecords();
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error saving attendance', 'error');
        this.loading = false;
      }
    });
  }

  openBulkUploadModal(): void {
    this.bulkUploadText = '';
    this.bulkEntries = [];
    this.selectedFile = null;
    this.selectedFileName = '';
    this.bulkUploadMode = 'file';
    this.showBulkUploadModal = true;
  }

  closeBulkUploadModal(): void {
    this.showBulkUploadModal = false;
    this.clearSelectedFile();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File): void {
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    
    if (!validTypes.some(ext => fileName.endsWith(ext))) {
      this.showMessage('Please select a valid Excel or CSV file', 'error');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.bulkEntries = [];
  }

  parseFileUpload(): void {
    if (!this.selectedFile) {
      this.showMessage('Please select a file first', 'error');
      return;
    }

    const reader = new FileReader();
    const fileName = this.selectedFile.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.parseCSVContent(content);
      };
      reader.readAsText(this.selectedFile);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      reader.onload = (e) => {
        const content = e.target?.result as ArrayBuffer;
        this.parseExcelContent(content);
      };
      reader.readAsArrayBuffer(this.selectedFile);
    }
  }

  parseCSVContent(content: string): void {
    const lines = content.trim().split('\n');
    this.bulkEntries = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      if (cols.length >= 4 && cols[0]) {
        this.bulkEntries.push({
          employeeCode: cols[0],
          date: cols[1],
          clockIn: cols[2],
          clockOut: cols[3],
          status: cols[4] || 'PRESENT',
          remarks: cols[5] || ''
        });
      }
    }

    if (this.bulkEntries.length > 0) {
      this.showMessage(`Parsed ${this.bulkEntries.length} entries from file`, 'success');
    } else {
      this.showMessage('No valid entries found in file', 'error');
    }
  }

  parseExcelContent(content: ArrayBuffer): void {
    try {
      const workbook = XLSX.read(content, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        this.showMessage('Excel file is empty or has no data rows', 'error');
        return;
      }

      this.bulkEntries = [];
      const headers = jsonData[0].map((h: any) => String(h).toLowerCase().replace(/\s+/g, ''));
      
      const empCodeIdx = headers.findIndex((h: string) => h.includes('employee') || h.includes('empcode') || h.includes('code'));
      const dateIdx = headers.findIndex((h: string) => h.includes('date'));
      const clockInIdx = headers.findIndex((h: string) => h.includes('clockin') || h.includes('in') || h.includes('start'));
      const clockOutIdx = headers.findIndex((h: string) => h.includes('clockout') || h.includes('out') || h.includes('end'));
      const statusIdx = headers.findIndex((h: string) => h.includes('status'));
      const remarksIdx = headers.findIndex((h: string) => h.includes('remark') || h.includes('note'));

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 2) continue;

        const employeeCode = empCodeIdx >= 0 ? String(row[empCodeIdx] || '').trim() : String(row[0] || '').trim();
        let dateValue = dateIdx >= 0 ? row[dateIdx] : row[1];
        const clockIn = clockInIdx >= 0 ? this.formatExcelTime(row[clockInIdx]) : this.formatExcelTime(row[2]);
        const clockOut = clockOutIdx >= 0 ? this.formatExcelTime(row[clockOutIdx]) : this.formatExcelTime(row[3]);
        const status = statusIdx >= 0 ? String(row[statusIdx] || 'PRESENT').toUpperCase().trim() : 'PRESENT';
        const remarks = remarksIdx >= 0 ? String(row[remarksIdx] || '').trim() : '';

        if (!employeeCode) continue;

        const formattedDate = this.formatExcelDate(dateValue);
        if (!formattedDate) continue;

        this.bulkEntries.push({
          employeeCode,
          date: formattedDate,
          clockIn: clockIn || '09:00',
          clockOut: clockOut || '18:00',
          status: ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND'].includes(status) ? status : 'PRESENT',
          remarks
        });
      }

      if (this.bulkEntries.length > 0) {
        this.showMessage(`Successfully parsed ${this.bulkEntries.length} entries from Excel file`, 'success');
      } else {
        this.showMessage('No valid attendance entries found in Excel file', 'error');
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      this.showMessage('Error parsing Excel file. Please check the file format.', 'error');
    }
  }

  formatExcelDate(value: any): string | null {
    if (!value) return null;
    
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        const year = date.y;
        const month = String(date.m).padStart(2, '0');
        const day = String(date.d).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    const strValue = String(value).trim();
    
    const isoMatch = strValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return strValue.substring(0, 10);
    
    const usMatch = strValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (usMatch) {
      const month = String(usMatch[1]).padStart(2, '0');
      const day = String(usMatch[2]).padStart(2, '0');
      return `${usMatch[3]}-${month}-${day}`;
    }
    
    return null;
  }

  formatExcelTime(value: any): string {
    if (!value) return '';
    
    if (typeof value === 'number') {
      const totalMinutes = Math.round(value * 24 * 60);
      const hours = Math.floor(totalMinutes / 60) % 24;
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    const strValue = String(value).trim();
    const timeMatch = strValue.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      return `${String(timeMatch[1]).padStart(2, '0')}:${timeMatch[2]}`;
    }
    
    return '';
  }

  parseBulkUpload(): void {
    const lines = this.bulkUploadText.trim().split('\n');
    this.bulkEntries = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length >= 4) {
        this.bulkEntries.push({
          employeeCode: cols[0],
          date: cols[1],
          clockIn: cols[2],
          clockOut: cols[3],
          status: cols[4] || 'PRESENT',
          remarks: cols[5] || ''
        });
      }
    }
  }

  uploadBulkEntries(): void {
    if (this.bulkEntries.length === 0) {
      this.showMessage('No valid entries to upload', 'error');
      return;
    }

    this.loading = false;
    this.attendanceService.bulkUpload(this.bulkEntries).subscribe({
      next: (result) => {
        this.showMessage(`Successfully uploaded ${result.count || this.bulkEntries.length} records`, 'success');
        this.closeBulkUploadModal();
        this.loadAttendanceRecords();
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error uploading attendance', 'error');
        this.loading = false;
      }
    });
  }

  openDirectEntryModal(): void {
    this.directEntryEmployees = [];
    this.directEntryStatus = 'PRESENT';
    this.directEntryDate = this.selectedDate;
    this.showDirectEntryModal = true;
  }

  closeDirectEntryModal(): void {
    this.showDirectEntryModal = false;
  }

  toggleDirectEntryEmployee(employeeId: number): void {
    const idx = this.directEntryEmployees.indexOf(employeeId);
    if (idx > -1) {
      this.directEntryEmployees.splice(idx, 1);
    } else {
      this.directEntryEmployees.push(employeeId);
    }
  }

  isEmployeeSelectedForDirect(employeeId: number): boolean {
    return this.directEntryEmployees.includes(employeeId);
  }

  selectAllEmployeesForDirect(): void {
    if (this.directEntryEmployees.length === this.employees.length) {
      this.directEntryEmployees = [];
    } else {
      this.directEntryEmployees = this.employees.map(e => e.id!);
    }
  }

  saveDirectEntries(): void {
    if (this.directEntryEmployees.length === 0) {
      this.showMessage('Please select at least one employee', 'error');
      return;
    }

    this.loading = false;
    let completed = 0;
    let errors = 0;

    this.directEntryEmployees.forEach(empId => {
      this.attendanceService.directEntry(empId, this.directEntryStatus, this.directEntryDate).subscribe({
        next: () => {
          completed++;
          if (completed + errors === this.directEntryEmployees.length) {
            this.finishDirectEntry(completed, errors);
          }
        },
        error: () => {
          errors++;
          if (completed + errors === this.directEntryEmployees.length) {
            this.finishDirectEntry(completed, errors);
          }
        }
      });
    });
  }

  finishDirectEntry(completed: number, errors: number): void {
    this.loading = false;
    if (errors === 0) {
      this.showMessage(`Successfully marked ${completed} employees as ${this.directEntryStatus}`, 'success');
    } else {
      this.showMessage(`Completed: ${completed}, Errors: ${errors}`, 'warning');
    }
    this.closeDirectEntryModal();
    this.loadAttendanceRecords();
  }

  openProjectTimeModal(): void {
    this.projectEntry = this.getEmptyProjectEntry();
    this.projectEntry.entryDate = this.selectedDate;
    this.showProjectTimeModal = true;
  }

  closeProjectTimeModal(): void {
    this.showProjectTimeModal = false;
  }

  getEmptyProjectEntry(): ProjectTimeEntry {
    return {
      projectCode: '',
      projectName: '',
      entryDate: new Date().toISOString().split('T')[0],
      entryType: 'HOURLY',
      hoursWorked: 8,
      isPresent: true,
      taskDescription: '',
      billable: true
    };
  }

  saveProjectTimeEntry(): void {
    if (!this.projectEntry.employeeId || !this.projectEntry.projectCode) {
      this.showMessage('Please fill required fields', 'error');
      return;
    }

    this.loading = false;
    this.attendanceService.createProjectTimeEntry(this.projectEntry).subscribe({
      next: () => {
        this.showMessage('Project time entry saved', 'success');
        this.closeProjectTimeModal();
        this.loadProjectTimeEntries();
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error saving project time', 'error');
        this.loading = false;
      }
    });
  }

  openRulesModal(): void {
    this.newRule = this.getEmptyRule();
    this.editingRule = null;
    this.showRulesModal = true;
  }

  closeRulesModal(): void {
    this.showRulesModal = false;
  }

  getEmptyRule(): AttendanceRule {
    return {
      ruleName: '',
      description: '',
      standardStartTime: '09:00',
      standardEndTime: '18:00',
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

  editRule(rule: AttendanceRule): void {
    this.editingRule = { ...rule };
    this.newRule = { ...rule };
    this.showRulesModal = true;
  }

  saveRule(): void {
    if (!this.newRule.ruleName) {
      this.showMessage('Please enter a rule name', 'error');
      return;
    }

    this.loading = false;
    const observable = this.editingRule?.id 
      ? this.attendanceService.updateRule(this.editingRule.id, this.newRule)
      : this.attendanceService.createRule(this.newRule);

    observable.subscribe({
      next: () => {
        this.showMessage('Rule saved successfully', 'success');
        this.closeRulesModal();
        this.loadAttendanceRules();
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error saving rule', 'error');
        this.loading = false;
      }
    });
  }

  deleteRule(rule: AttendanceRule): void {
    if (!rule.id || !confirm('Are you sure you want to delete this rule?')) return;

    this.attendanceService.deleteRule(rule.id).subscribe({
      next: () => {
        this.showMessage('Rule deleted', 'success');
        this.loadAttendanceRules();
      },
      error: (err) => this.showMessage('Error deleting rule', 'error')
    });
  }

  approveRecord(record: AttendanceRecord): void {
    if (!record.id) return;
    this.attendanceService.approve(record.id).subscribe({
      next: () => {
        this.showMessage('Record approved', 'success');
        this.loadAttendanceRecords();
      },
      error: (err) => this.showMessage('Error approving record', 'error')
    });
  }

  calculateHours(): void {
    if (this.manualEntry.clockIn && this.manualEntry.clockOut) {
      const [inH, inM] = this.manualEntry.clockIn.split(':').map(Number);
      const [outH, outM] = this.manualEntry.clockOut.split(':').map(Number);
      
      let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      totalMinutes -= (this.manualEntry.breakDuration || 0) * 60;
      
      const totalHours = totalMinutes / 60;
      const regularHours = Math.min(totalHours, 8);
      const overtimeHours = Math.max(0, totalHours - 8);
      
      this.manualEntry.regularHours = Math.round(regularHours * 100) / 100;
      this.manualEntry.overtimeHours = Math.round(overtimeHours * 100) / 100;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PRESENT': return 'present';
      case 'ABSENT': return 'absent';
      case 'HALF_DAY': return 'half-day';
      case 'ON_LEAVE': return 'on-leave';
      case 'HOLIDAY': return 'holiday';
      case 'WEEKEND': return 'weekend';
      default: return '';
    }
  }

  getApprovalClass(status: string): string {
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

  getEmployeeName(emp: any): string {
    if (!emp) return 'Unknown';
    return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown';
  }

  formatTime(time: string | undefined): string {
    if (!time) return '-';
    return time;
  }

  countByStatus(status: string): number {
    return this.getFilteredRecords().filter(r => r.status === status).length;
  }
}
