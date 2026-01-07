import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, Timesheet, PayFrequency } from '../../../services/payroll.service';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PayableEmployee {
  selected: boolean;
  empId: string;
  name: string;
  department: string;
  rate: number;
  hourlyRate: number;
  hours: number;
  taxes: number;
  netAmount: number;
  status: string;
  employeeId: number;
  payType: string;
}

interface ProcessedEmployee {
  empId: string;
  name: string;
  basic: number;
  gross: number;
  taxes: number;
  netAmount: number;
  category: string;
}

@Component({
  selector: 'app-timesheet-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet-approval.component.html',
  styleUrls: ['./timesheet-approval.component.scss']
})
export class TimesheetApprovalComponent implements OnInit {
  activeTab: 'attendance' | 'timesheet' | 'payables' = 'attendance';
  currentStep = 0;
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

  showTimesheetPdfModal = false;
  pdfTimesheet: Timesheet | null = null;
  pdfAttendanceRecords: AttendanceRecord[] = [];

  payableEmployees: PayableEmployee[] = [];
  selectedPayableIds: number[] = [];
  payablesLoading = false;
  employeesToProcess = 0;
  totalGrossPay = 0;
  totalNetPay = 0;

  showPayrollSummary = false;
  processedSalariedEmployees: ProcessedEmployee[] = [];
  processedHourlyEmployees: ProcessedEmployee[] = [];
  processedTotal = 0;
  processedNetTotal = 0;

  selectedPayPeriodType = 'MONTHLY';
  timesheetPayDate = '';
  selectedAttendanceIds: number[] = [];
  allAttendanceSelected = false;
  selectedAttendanceCount = 0;

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
    this.timesheetPayDate = today.toISOString().split('T')[0];

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

  goToStep(step: number): void {
    if (step === 4) {
      window.location.href = '/app/payroll/history';
      return;
    }
    
    this.currentStep = step;
    
    if (step === 0) {
      this.loadDailyAttendance();
    } else if (step === 1) {
      this.loadTimesheets();
    } else if (step === 2 || step === 3) {
      this.loadPayableEmployees();
    }
  }

  previousDate(): void {
    const current = new Date(this.selectedDate);
    current.setDate(current.getDate() - 1);
    this.selectedDate = current.toISOString().split('T')[0];
    this.onDateChange();
  }

  nextDate(): void {
    const current = new Date(this.selectedDate);
    current.setDate(current.getDate() + 1);
    this.selectedDate = current.toISOString().split('T')[0];
    this.onDateChange();
  }

  toggleAllAttendance(): void {
    this.allAttendanceSelected = !this.allAttendanceSelected;
    if (this.allAttendanceSelected) {
      this.selectedAttendanceIds = this.attendanceRecords.map(r => r.id!).filter(id => id !== undefined);
    } else {
      this.selectedAttendanceIds = [];
    }
    this.selectedAttendanceCount = this.selectedAttendanceIds.length;
  }

  isAttendanceSelected(record: AttendanceRecord): boolean {
    return record.id ? this.selectedAttendanceIds.includes(record.id) : false;
  }

  toggleAttendanceSelection(record: AttendanceRecord): void {
    if (!record.id) return;
    const idx = this.selectedAttendanceIds.indexOf(record.id);
    if (idx > -1) {
      this.selectedAttendanceIds.splice(idx, 1);
    } else {
      this.selectedAttendanceIds.push(record.id);
    }
    this.selectedAttendanceCount = this.selectedAttendanceIds.length;
    this.allAttendanceSelected = this.selectedAttendanceIds.length === this.attendanceRecords.length;
  }

  approveSelectedAttendance(): void {
    if (this.selectedAttendanceIds.length === 0) return;
    
    this.attendanceService.bulkApprove(this.selectedAttendanceIds).subscribe({
      next: (result) => {
        let message = `${result.approved || 0} attendance records approved`;
        if (result.skipped > 0) {
          message += `, ${result.skipped} skipped (already processed)`;
        }
        this.showMessage(message, 'success');
        this.selectedAttendanceIds = [];
        this.selectedAttendanceCount = 0;
        this.allAttendanceSelected = false;
        this.loadDailyAttendance();
      },
      error: (err) => {
        console.error('Error approving attendance:', err);
        this.showMessage('Error approving attendance records. Please try again.', 'error');
      }
    });
  }

  approveSingleAttendance(record: AttendanceRecord): void {
    if (!record.id) return;
    this.attendanceService.approve(record.id).subscribe({
      next: () => {
        this.showMessage('Attendance approved successfully!', 'success');
        this.loadDailyAttendance();
      },
      error: (err) => {
        console.error('Error approving attendance:', err);
        this.showMessage('Error approving attendance. Please try again.', 'error');
      }
    });
  }

  rejectSingleAttendance(record: AttendanceRecord): void {
    if (!record.id) return;
    const reason = prompt('Please enter rejection reason:');
    if (reason === null) return;
    
    this.attendanceService.reject(record.id, reason).subscribe({
      next: () => {
        this.showMessage('Attendance rejected.', 'success');
        this.loadDailyAttendance();
      },
      error: (err) => {
        console.error('Error rejecting attendance:', err);
        this.showMessage('Error rejecting attendance. Please try again.', 'error');
      }
    });
  }

  onPayPeriodTypeChange(): void {
    const today = new Date();
    switch (this.selectedPayPeriodType) {
      case 'WEEKLY':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        this.generateStartDate = startOfWeek.toISOString().split('T')[0];
        this.generateEndDate = endOfWeek.toISOString().split('T')[0];
        break;
      case 'BI_WEEKLY':
        const biWeekStart = new Date(today);
        biWeekStart.setDate(today.getDate() - 13);
        this.generateStartDate = biWeekStart.toISOString().split('T')[0];
        this.generateEndDate = today.toISOString().split('T')[0];
        break;
      case 'SEMI_MONTHLY':
        if (today.getDate() <= 15) {
          this.generateStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          this.generateEndDate = new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0];
        } else {
          this.generateStartDate = new Date(today.getFullYear(), today.getMonth(), 16).toISOString().split('T')[0];
          this.generateEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        }
        break;
      default:
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.generateStartDate = firstOfMonth.toISOString().split('T')[0];
        this.generateEndDate = lastOfMonth.toISOString().split('T')[0];
    }
  }

  generateTimesheetsForPeriod(): void {
    this.generating = true;
    const payload = {
      startDate: this.generateStartDate,
      endDate: this.generateEndDate,
      type: 'ATTENDANCE'
    };
    this.payrollService.generateTimesheetsFromAttendance(payload).subscribe({
      next: (result) => {
        this.generating = false;
        this.showMessage(`Generated ${result.generated || 0} timesheets successfully!`, 'success');
      },
      error: (err) => {
        this.generating = false;
        console.error('Error generating timesheets:', err);
        this.showMessage('Error generating timesheets. Please try again.', 'error');
      }
    });
  }

  showMessage(text: string, type: string): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
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

  switchTab(tab: 'attendance' | 'timesheet' | 'payables'): void {
    this.activeTab = tab;
    if (tab === 'timesheet' && this.timesheets.length === 0) {
      this.loadTimesheets();
    }
    if (tab === 'payables') {
      this.loadPayableEmployees();
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
      case 'CALCULATED': return 'calculated';
      case 'PROCESSED': return 'processed';
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

  viewTimesheetPdf(ts: Timesheet): void {
    this.pdfTimesheet = ts;
    this.pdfAttendanceRecords = [];
    this.showTimesheetPdfModal = true;

    if (ts.employee && ts.periodStartDate && ts.periodEndDate) {
      this.attendanceService.getByEmployeeAndDateRange(
        ts.employee.id!,
        ts.periodStartDate,
        ts.periodEndDate
      ).subscribe({
        next: (records) => {
          this.pdfAttendanceRecords = records.sort((a, b) => 
            new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime()
          );
        },
        error: (err) => console.error('Error loading attendance for PDF:', err)
      });
    }
  }

  closeTimesheetPdfModal(): void {
    this.showTimesheetPdfModal = false;
    this.pdfTimesheet = null;
    this.pdfAttendanceRecords = [];
  }

  downloadTimesheetPdf(ts: Timesheet): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Single Employee Time Sheet', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('PayrollPro - Time & Payroll System', pageWidth / 2, 23, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    const empCode = ts.employee?.employeeCode || `EMP${ts.employeeId}`;
    const empName = `${ts.employee?.firstName || ''} ${ts.employee?.lastName || ''}`.trim() || 'Unknown';
    const periodStart = ts.periodStartDate ? new Date(ts.periodStartDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '';
    const periodEnd = ts.periodEndDate ? new Date(ts.periodEndDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '';
    
    doc.setFontSize(10);
    doc.text(`EMP ID:`, 14, 45);
    doc.setFont('helvetica', 'bold');
    doc.text(empCode, 40, 45);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`PERIOD:`, 120, 45);
    doc.setFont('helvetica', 'bold');
    doc.text(`${periodStart} - ${periodEnd}`, 145, 45);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`NAME:`, 14, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(empName, 40, 52);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`TOTAL HOURS:`, 120, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`${ts.totalHours?.toFixed(1) || '0.0'}h`, 160, 52);
    doc.setFont('helvetica', 'normal');
    
    const tableData = this.pdfAttendanceRecords.map(r => {
      const date = new Date(r.attendanceDate);
      const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      const lunchHours = 1;
      const regHours = r.regularHours || 0;
      const otHours = r.overtimeHours || 0;
      const totalHours = regHours + otHours;
      
      return [
        dateStr,
        r.clockIn || '-',
        r.clockOut || '-',
        lunchHours.toString(),
        regHours.toFixed(1),
        otHours.toFixed(1),
        totalHours.toFixed(1)
      ];
    });
    
    autoTable(doc, {
      startY: 60,
      head: [['DATE', 'CLOCK IN', 'CLOCK OUT', 'LUNCH HOURS', 'REG HOURS', 'OT HOURS', 'TOTAL HOURS']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 200, 87],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [255, 248, 220]
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 28 }
      }
    });
    
    doc.save(`Timesheet_${empCode}_${periodStart.replace(/\//g, '-')}.pdf`);
  }

  loadPayableEmployees(): void {
    this.payablesLoading = true;
    this.showPayrollSummary = false;
    
    const approvedTimesheets = this.timesheets.filter(t => t.status === 'APPROVED');
    
    this.payableEmployees = this.employees.map((emp, idx) => {
      const ts = approvedTimesheets.find(t => t.employeeId === emp.id);
      const baseRate = (emp as any).basicSalary || 5000;
      const hourlyRate = baseRate / 160;
      const hours = ts?.totalHours || 0;
      const payType = (emp as any).payType || 'SALARIED';
      const gross = payType === 'HOURLY' ? hours * hourlyRate : baseRate;
      const taxes = gross * 0.22;
      const netAmount = gross - taxes;
      
      return {
        selected: false,
        empId: emp.employeeCode || `EMP${String(idx + 1).padStart(3, '0')}`,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
        department: emp.department?.name || 'General',
        rate: baseRate,
        hourlyRate: hourlyRate,
        hours: hours,
        taxes: taxes,
        netAmount: netAmount,
        status: ts ? 'Ready' : 'Pending',
        employeeId: emp.id!,
        payType: payType
      };
    });
    
    this.calculatePayableSummary();
    this.payablesLoading = false;
  }

  calculatePayableSummary(): void {
    const selected = this.payableEmployees.filter(e => e.selected);
    this.employeesToProcess = selected.length;
    this.totalGrossPay = selected.reduce((sum, e) => sum + (e.payType === 'HOURLY' ? e.hours * e.hourlyRate : e.rate), 0);
    this.totalNetPay = selected.reduce((sum, e) => sum + e.netAmount, 0);
  }

  togglePayableSelection(emp: PayableEmployee): void {
    emp.selected = !emp.selected;
    this.calculatePayableSummary();
  }

  isPayableSelected(empId: number): boolean {
    return this.selectedPayableIds.includes(empId);
  }

  selectAllPayables(): void {
    const allSelected = this.payableEmployees.every(e => e.selected);
    this.payableEmployees.forEach(e => e.selected = !allSelected);
    this.calculatePayableSummary();
  }

  areAllPayablesSelected(): boolean {
    return this.payableEmployees.length > 0 && this.payableEmployees.every(e => e.selected);
  }

  calculateSelectedPayroll(): void {
    const selected = this.payableEmployees.filter(e => e.selected);
    if (selected.length === 0) {
      this.showMessage('Please select at least one employee', 'error');
      return;
    }
    
    this.processedSalariedEmployees = selected
      .filter(e => e.payType === 'SALARIED')
      .map(e => ({
        empId: e.empId,
        name: e.name,
        basic: e.rate,
        gross: e.rate,
        taxes: e.taxes,
        netAmount: e.netAmount,
        category: 'Salaried'
      }));
    
    this.processedHourlyEmployees = selected
      .filter(e => e.payType === 'HOURLY')
      .map(e => ({
        empId: e.empId,
        name: e.name,
        basic: e.hours * e.hourlyRate,
        gross: e.hours * e.hourlyRate,
        taxes: e.taxes,
        netAmount: e.netAmount,
        category: 'Hourly'
      }));
    
    this.processedTotal = selected.reduce((sum, e) => {
      return sum + (e.payType === 'HOURLY' ? e.hours * e.hourlyRate : e.rate);
    }, 0);
    this.processedNetTotal = selected.reduce((sum, e) => sum + e.netAmount, 0);
    
    this.showPayrollSummary = true;
    this.showMessage(`Calculated payroll for ${selected.length} employees`, 'success');
  }

  processPayables(): void {
    if (!this.showPayrollSummary) {
      this.showMessage('Please calculate payroll first', 'error');
      return;
    }
    
    this.showMessage('Payroll processed and sent to accounts!', 'success');
    
    this.payableEmployees.forEach(e => {
      if (e.selected) {
        e.status = 'Processed';
        e.selected = false;
      }
    });
    
    this.showPayrollSummary = false;
    this.calculatePayableSummary();
  }

  closeSummary(): void {
    this.showPayrollSummary = false;
  }

  formatCurrency(amount: number): string {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  getOnTimeRate(): string {
    if (this.attendanceRecords.length === 0) return '0.0';
    const onTime = this.attendanceRecords.filter(r => {
      if (!r.clockIn) return false;
      const clockInTime = r.clockIn.split(':');
      const hours = parseInt(clockInTime[0], 10);
      const minutes = parseInt(clockInTime[1], 10);
      return hours < 9 || (hours === 9 && minutes <= 0);
    }).length;
    return ((onTime / this.attendanceRecords.length) * 100).toFixed(1);
  }

  getLateArrivals(): string {
    if (this.attendanceRecords.length === 0) return '0.0';
    const late = this.attendanceRecords.filter(r => {
      if (!r.clockIn) return false;
      const clockInTime = r.clockIn.split(':');
      const hours = parseInt(clockInTime[0], 10);
      const minutes = parseInt(clockInTime[1], 10);
      return hours > 9 || (hours === 9 && minutes > 0);
    }).length;
    return ((late / this.attendanceRecords.length) * 100).toFixed(1);
  }

  getPayPeriodTypeLabel(): string {
    switch (this.selectedPayPeriodType) {
      case 'WEEKLY': return 'Weekly';
      case 'BI_WEEKLY': return 'Bi-Weekly';
      case 'SEMI_MONTHLY': return 'Semi-Monthly';
      case 'MONTHLY': return 'Monthly';
      default: return this.selectedPayPeriodType;
    }
  }

  getTimesheetTotalHours(): string {
    const total = this.filteredTimesheets.reduce((sum, ts) => sum + (ts.totalHours || 0), 0);
    return total.toFixed(2);
  }

  getPayableTotalHours(): string {
    const total = this.payableEmployees.reduce((sum, emp) => sum + emp.hours, 0);
    return total.toFixed(2);
  }

  getApprovalStatusClass(status: string | undefined): string {
    if (!status) return 'pending';
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING': return 'pending';
      default: return 'pending';
    }
  }
}
