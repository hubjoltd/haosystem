import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, Timesheet, PayFrequency } from '../../../services/payroll.service';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService, Employee, EmployeeSalary } from '../../../services/employee.service';
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

interface ApprovedAttendanceRow {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  attendanceDate: string;
  clockIn: string;
  clockOut: string;
  regularHours: number;
  overtimeHours: number;
  status: string;
}

@Component({
  selector: 'app-timesheet-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet-approval.component.html',
  styleUrls: ['./timesheet-approval.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimesheetApprovalComponent implements OnInit {
  currentStep = 0;
  loading = false;
  message = '';
  messageType = '';
  dataLoaded = false;

  employees: Employee[] = [];
  approvedAttendanceRecords: ApprovedAttendanceRow[] = [];
  timesheets: Timesheet[] = [];
  filteredTimesheets: Timesheet[] = [];
  payFrequencies: PayFrequency[] = [];

  // Step 1: Approved Attendance date range
  approvedStartDate: string = '';
  approvedEndDate: string = '';
  
  // Summary stats for Step 1
  totalApprovedEmployees = 0;
  totalApprovedHours = 0;
  totalApprovedOT = 0;
  totalApprovedRecords = 0;

  // Step 2: Generate Timesheet
  selectedPayPeriodType = 'MONTHLY';
  generateStartDate = '';
  generateEndDate = '';
  generating = false;
  
  allTimesheetEmployeesSelected = false;
  selectedTimesheetEmployeeIds: number[] = [];
  timesheetEmployees: Employee[] = [];

  // Step 3: Calculate Payroll
  payableEmployees: PayableEmployee[] = [];
  allCalcEmployeesSelected = false;
  selectedCalcEmployeeIds: number[] = [];
  totalGrossPay = 0;
  totalNetPay = 0;
  employeeSalaryMap: Map<number, EmployeeSalary> = new Map();
  payablesLoading = false;

  // Step 4: Process Payroll
  employeesToProcess = 0;
  showPayrollSummary = false;
  processedSalariedEmployees: ProcessedEmployee[] = [];
  processedHourlyEmployees: ProcessedEmployee[] = [];
  processedTotal = 0;
  processedNetTotal = 0;

  constructor(
    private payrollService: PayrollService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadEmployees();
    this.loadPayFrequencies();
  }

  setDefaultDates(): void {
    const today = new Date();
    
    // Default to current month for approved attendance
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.approvedStartDate = firstOfMonth.toISOString().split('T')[0];
    this.approvedEndDate = lastOfMonth.toISOString().split('T')[0];
    this.generateStartDate = firstOfMonth.toISOString().split('T')[0];
    this.generateEndDate = lastOfMonth.toISOString().split('T')[0];
  }

  goToStep(step: number): void {
    if (step === 5) {
      window.location.href = '/app/payroll/history';
      return;
    }
    
    this.currentStep = step;
    
    if (step === 0) {
      this.loadApprovedAttendance();
    } else if (step === 1) {
      // Step 2: Generate Timesheet - employees already loaded
    } else if (step === 2 || step === 3) {
      this.loadPayableEmployees();
    }
    this.cdr.markForCheck();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data.filter(e => e.active);
        this.timesheetEmployees = [...this.employees];
        // Auto-load approved attendance immediately
        this.loadApprovedAttendance();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.cdr.markForCheck();
      }
    });
  }

  loadApprovedAttendance(forceReload: boolean = false): void {
    if (this.dataLoaded && !forceReload) {
      return;
    }
    
    this.loading = true;
    this.approvedAttendanceRecords = [];
    this.cdr.markForCheck();
    
    // Use the date-range endpoint to get all attendance in range
    this.attendanceService.getByDateRange(this.approvedStartDate, this.approvedEndDate).subscribe({
      next: (records) => {
        // Filter only approved records and build display data
        const approved = records.filter(r => r.approvalStatus === 'APPROVED');
        
        this.approvedAttendanceRecords = approved.map(r => {
          const emp = this.employees.find(e => e.id === r.employeeId);
          return {
            id: r.id!,
            employeeId: r.employeeId!,
            employeeCode: emp?.employeeCode || `EMP${r.employeeId}`,
            employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Unknown',
            department: emp?.department?.name || 'General',
            attendanceDate: r.attendanceDate,
            clockIn: r.clockIn || '-',
            clockOut: r.clockOut || '-',
            regularHours: r.regularHours || 0,
            overtimeHours: r.overtimeHours || 0,
            status: r.approvalStatus || 'APPROVED'
          };
        });
        
        this.calculateApprovedSummary();
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading approved attendance:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  calculateApprovedSummary(): void {
    const uniqueEmployees = new Set(this.approvedAttendanceRecords.map(r => r.employeeId));
    this.totalApprovedEmployees = uniqueEmployees.size;
    this.totalApprovedRecords = this.approvedAttendanceRecords.length;
    this.totalApprovedHours = this.approvedAttendanceRecords.reduce((sum, r) => sum + r.regularHours, 0);
    this.totalApprovedOT = this.approvedAttendanceRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
  }

  onApprovedDateChange(): void {
    this.loadApprovedAttendance(true);
  }

  loadPayFrequencies(): void {
    this.payrollService.getPayFrequencies().subscribe({
      next: (data) => {
        this.payFrequencies = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading pay frequencies:', err)
    });
  }

  // Step 2: Generate Timesheet
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
    this.cdr.markForCheck();
  }

  toggleAllTimesheetEmployees(): void {
    this.allTimesheetEmployeesSelected = !this.allTimesheetEmployeesSelected;
    if (this.allTimesheetEmployeesSelected) {
      this.selectedTimesheetEmployeeIds = this.timesheetEmployees.map(e => e.id!);
    } else {
      this.selectedTimesheetEmployeeIds = [];
    }
    this.cdr.markForCheck();
  }

  toggleTimesheetEmployeeSelection(empId: number): void {
    const idx = this.selectedTimesheetEmployeeIds.indexOf(empId);
    if (idx > -1) {
      this.selectedTimesheetEmployeeIds.splice(idx, 1);
    } else {
      this.selectedTimesheetEmployeeIds.push(empId);
    }
    this.allTimesheetEmployeesSelected = this.selectedTimesheetEmployeeIds.length === this.timesheetEmployees.length;
    this.cdr.markForCheck();
  }

  isTimesheetEmployeeSelected(empId: number): boolean {
    return this.selectedTimesheetEmployeeIds.includes(empId);
  }

  generateTimesheetsForPeriod(): void {
    if (this.selectedTimesheetEmployeeIds.length === 0) {
      this.showMessage('Please select at least one employee', 'error');
      return;
    }
    
    this.generating = true;
    this.cdr.markForCheck();
    
    const payload: any = {
      startDate: this.generateStartDate,
      endDate: this.generateEndDate,
      type: 'ATTENDANCE',
      employeeIds: this.selectedTimesheetEmployeeIds
    };
    
    this.payrollService.generateTimesheetsFromAttendance(payload).subscribe({
      next: (result) => {
        this.generating = false;
        this.showMessage(`Generated ${result.generated || 0} timesheets for ${this.selectedTimesheetEmployeeIds.length} employees!`, 'success');
        this.loadTimesheets();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.generating = false;
        console.error('Error generating timesheets:', err);
        this.showMessage('Error generating timesheets. Please try again.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  loadTimesheets(): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.payrollService.getTimesheets().subscribe({
      next: (data) => {
        this.timesheets = data;
        this.filteredTimesheets = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading timesheets:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Step 3: Calculate Payroll
  toggleAllCalcEmployees(): void {
    this.allCalcEmployeesSelected = !this.allCalcEmployeesSelected;
    if (this.allCalcEmployeesSelected) {
      this.selectedCalcEmployeeIds = this.payableEmployees.map(e => e.employeeId);
    } else {
      this.selectedCalcEmployeeIds = [];
    }
    this.updateCalcSummary();
    this.cdr.markForCheck();
  }

  toggleCalcEmployeeSelection(empId: number): void {
    const idx = this.selectedCalcEmployeeIds.indexOf(empId);
    if (idx > -1) {
      this.selectedCalcEmployeeIds.splice(idx, 1);
    } else {
      this.selectedCalcEmployeeIds.push(empId);
    }
    this.allCalcEmployeesSelected = this.selectedCalcEmployeeIds.length === this.payableEmployees.length;
    this.updateCalcSummary();
    this.cdr.markForCheck();
  }

  isCalcEmployeeSelected(empId: number): boolean {
    return this.selectedCalcEmployeeIds.includes(empId);
  }

  updateCalcSummary(): void {
    const selected = this.payableEmployees.filter(e => this.selectedCalcEmployeeIds.includes(e.employeeId));
    this.totalGrossPay = selected.reduce((sum, e) => sum + (e.payType === 'HOURLY' ? e.hours * e.hourlyRate : e.rate), 0);
    this.totalNetPay = selected.reduce((sum, e) => sum + e.netAmount, 0);
  }

  loadPayableEmployees(): void {
    this.payablesLoading = true;
    this.showPayrollSummary = false;
    this.employeeSalaryMap.clear();
    this.cdr.markForCheck();
    
    if (this.employees.length === 0) {
      this.payablesLoading = false;
      this.cdr.markForCheck();
      return;
    }

    let completed = 0;
    const total = this.employees.length;

    this.employees.forEach(emp => {
      if (emp.id) {
        this.employeeService.getCurrentSalary(emp.id).subscribe({
          next: (salary) => {
            this.employeeSalaryMap.set(emp.id!, salary);
            completed++;
            if (completed === total) {
              this.buildPayableEmployeesList();
            }
          },
          error: () => {
            completed++;
            if (completed === total) {
              this.buildPayableEmployeesList();
            }
          }
        });
      } else {
        completed++;
        if (completed === total) {
          this.buildPayableEmployeesList();
        }
      }
    });
  }

  buildPayableEmployeesList(): void {
    const approvedTimesheets = this.timesheets.filter(t => t.status === 'APPROVED');
    
    this.payableEmployees = this.employees.map((emp, idx) => {
      const ts = approvedTimesheets.find(t => t.employeeId === emp.id);
      const salary = emp.id ? this.employeeSalaryMap.get(emp.id) : null;
      
      const baseRate = salary?.basicSalary || 0;
      const hourlyRate = salary?.hourlyRate || (baseRate > 0 ? baseRate / 160 : 0);
      const hours = ts?.totalHours || 0;
      const payFrequency = salary?.payFrequency || 'MONTHLY';
      const payType = payFrequency === 'HOURLY' || hourlyRate > 0 && baseRate === 0 ? 'HOURLY' : 'SALARIED';
      const gross = payType === 'HOURLY' ? hours * hourlyRate : baseRate;
      const taxRate = 0.22;
      const taxes = gross * taxRate;
      const netAmount = gross - taxes;
      
      const hasSalaryData = salary && (baseRate > 0 || hourlyRate > 0);
      let status = 'No Salary Data';
      if (hasSalaryData) {
        status = ts ? 'Ready' : 'Pending Timesheet';
      }
      
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
        status: status,
        employeeId: emp.id!,
        payType: payType
      };
    });
    
    this.calculatePayableSummary();
    this.payablesLoading = false;
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  selectAllPayables(): void {
    const allSelected = this.payableEmployees.every(e => e.selected);
    this.payableEmployees.forEach(e => e.selected = !allSelected);
    this.calculatePayableSummary();
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  closeSummary(): void {
    this.showPayrollSummary = false;
    this.cdr.markForCheck();
  }

  showMessage(text: string, type: string): void {
    this.message = text;
    this.messageType = type;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
      this.cdr.markForCheck();
    }, 5000);
  }

  formatCurrency(amount: number): string {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING': case 'PENDING_APPROVAL': return 'pending';
      case 'PROCESSED': return 'processed';
      default: return 'pending';
    }
  }
}
