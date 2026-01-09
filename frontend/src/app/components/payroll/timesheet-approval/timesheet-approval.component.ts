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

interface GeneratedTimesheetSummary {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalHours: number;
  status: string;
  records: ApprovedAttendanceRow[];
}

interface IndividualTimesheetRow {
  sno: number;
  date: string;
  day: string;
  clockIn: string;
  clockOut: string;
  lunchHour: number;
  regHours: number;
  otHours: number;
  totalHours: number;
  status: string;
}

interface PayrollCalculationRow {
  sno: number;
  empId: string;
  name: string;
  type: string;
  hours: number;
  hourlyRate: number;
  gross: number;
  federal: number;
  state: number;
  socSec: number;
  medicare: number;
  totalTax: number;
  netPay: number;
  status: string;
  employeeId: number;
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
  
  generatedTimesheets: GeneratedTimesheetSummary[] = [];
  timesheetsGenerated = false;
  
  showTimesheetModal = false;
  selectedTimesheetEmployee: GeneratedTimesheetSummary | null = null;
  individualTimesheetRows: IndividualTimesheetRow[] = [];

  // Step 3: Calculate Payroll (new design)
  payrollCalculationRows: PayrollCalculationRow[] = [];
  payrollCalcLoading = false;
  step3TotalGross = 0;
  step3TotalTax = 0;
  step3TotalNetPay = 0;
  step3TotalHours = 0;
  step3EmployeeCount = 0;
  
  // Legacy Step 3 fields (keep for Step 4 compatibility)
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
    } else if (step === 2) {
      // Step 3: Calculate Payroll - auto-calculate from generated timesheets
      this.autoCalculatePayroll();
    } else if (step === 3) {
      this.loadPayableEmployees();
    }
    this.cdr.markForCheck();
  }
  
  autoCalculatePayroll(): void {
    this.payrollCalcLoading = true;
    this.payrollCalculationRows = [];
    this.cdr.markForCheck();
    
    // Load salary data for all employees with generated timesheets
    if (this.generatedTimesheets.length === 0) {
      this.payrollCalcLoading = false;
      this.step3TotalGross = 0;
      this.step3TotalTax = 0;
      this.step3TotalNetPay = 0;
      this.step3TotalHours = 0;
      this.step3EmployeeCount = 0;
      this.cdr.markForCheck();
      return;
    }
    
    let completed = 0;
    const total = this.generatedTimesheets.length;
    const tempRows: PayrollCalculationRow[] = [];
    
    this.generatedTimesheets.forEach((ts, idx) => {
      this.employeeService.getCurrentSalary(ts.employeeId).subscribe({
        next: (salary) => {
          const hourlyRate = salary?.hourlyRate || 0;
          const totalHours = ts.totalHours;
          const gross = totalHours * hourlyRate;
          // All taxes are 0 as per requirement
          const federal = 0;
          const state = 0;
          const socSec = 0;
          const medicare = 0;
          const totalTax = 0;
          const netPay = gross - totalTax;
          
          tempRows.push({
            sno: idx + 1,
            empId: ts.employeeCode,
            name: `${ts.firstName} ${ts.lastName}`.trim(),
            type: 'Hourly',
            hours: totalHours,
            hourlyRate: hourlyRate,
            gross: gross,
            federal: federal,
            state: state,
            socSec: socSec,
            medicare: medicare,
            totalTax: totalTax,
            netPay: netPay,
            status: 'Calculated',
            employeeId: ts.employeeId
          });
          
          completed++;
          if (completed === total) {
            this.finalizePayrollCalculation(tempRows);
          }
        },
        error: () => {
          // If no salary data, use 0 hourly rate
          const totalHours = ts.totalHours;
          tempRows.push({
            sno: idx + 1,
            empId: ts.employeeCode,
            name: `${ts.firstName} ${ts.lastName}`.trim(),
            type: 'Hourly',
            hours: totalHours,
            hourlyRate: 0,
            gross: 0,
            federal: 0,
            state: 0,
            socSec: 0,
            medicare: 0,
            totalTax: 0,
            netPay: 0,
            status: 'No Rate',
            employeeId: ts.employeeId
          });
          
          completed++;
          if (completed === total) {
            this.finalizePayrollCalculation(tempRows);
          }
        }
      });
    });
  }
  
  finalizePayrollCalculation(rows: PayrollCalculationRow[]): void {
    // Sort by employee code and reassign S.NO
    rows.sort((a, b) => a.empId.localeCompare(b.empId));
    rows.forEach((row, idx) => row.sno = idx + 1);
    
    this.payrollCalculationRows = rows;
    this.step3TotalHours = rows.reduce((sum, r) => sum + r.hours, 0);
    this.step3TotalGross = rows.reduce((sum, r) => sum + r.gross, 0);
    this.step3TotalTax = rows.reduce((sum, r) => sum + r.totalTax, 0);
    this.step3TotalNetPay = rows.reduce((sum, r) => sum + r.netPay, 0);
    this.step3EmployeeCount = rows.length;
    
    // Also sync to legacy fields for Step 4
    this.totalGrossPay = this.step3TotalGross;
    this.totalNetPay = this.step3TotalNetPay;
    
    this.payrollCalcLoading = false;
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
    this.generating = true;
    this.generatedTimesheets = [];
    this.cdr.markForCheck();
    
    this.attendanceService.getByDateRange(this.generateStartDate, this.generateEndDate).subscribe({
      next: (records) => {
        const approvedRecords = records.filter(r => r.approvalStatus === 'APPROVED');
        
        const employeeMap = new Map<number, GeneratedTimesheetSummary>();
        
        approvedRecords.forEach(r => {
          const empId = r.employeeId!;
          const emp = this.employees.find(e => e.id === empId);
          
          if (!employeeMap.has(empId)) {
            employeeMap.set(empId, {
              employeeId: empId,
              employeeCode: emp?.employeeCode || `EMP${empId}`,
              firstName: emp?.firstName || 'Unknown',
              lastName: emp?.lastName || '',
              department: emp?.department?.name || 'General',
              totalRegularHours: 0,
              totalOvertimeHours: 0,
              totalHours: 0,
              status: 'Generated',
              records: []
            });
          }
          
          const ts = employeeMap.get(empId)!;
          const regHours = r.regularHours || 0;
          const otHours = r.overtimeHours || 0;
          
          ts.totalRegularHours += regHours;
          ts.totalOvertimeHours += otHours;
          ts.totalHours += regHours + otHours;
          
          ts.records.push({
            id: r.id!,
            employeeId: empId,
            employeeCode: emp?.employeeCode || `EMP${empId}`,
            employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
            department: emp?.department?.name || 'General',
            attendanceDate: r.attendanceDate,
            clockIn: r.clockIn || '-',
            clockOut: r.clockOut || '-',
            regularHours: regHours,
            overtimeHours: otHours,
            status: 'Approved'
          });
        });
        
        this.generatedTimesheets = Array.from(employeeMap.values());
        this.generatedTimesheets.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
        
        this.timesheetsGenerated = true;
        this.generating = false;
        this.showMessage(`Generated ${this.generatedTimesheets.length} timesheets from approved attendance!`, 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error generating timesheets:', err);
        this.generating = false;
        this.showMessage('Error generating timesheets', 'error');
        this.cdr.markForCheck();
      }
    });
  }
  
  viewTimesheet(ts: GeneratedTimesheetSummary): void {
    this.selectedTimesheetEmployee = ts;
    this.individualTimesheetRows = ts.records.map((r, idx) => {
      const date = new Date(r.attendanceDate);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        sno: idx + 1,
        date: r.attendanceDate,
        day: dayName,
        clockIn: r.clockIn,
        clockOut: r.clockOut,
        lunchHour: 1,
        regHours: r.regularHours,
        otHours: r.overtimeHours,
        totalHours: r.regularHours + r.overtimeHours,
        status: r.status
      };
    });
    this.showTimesheetModal = true;
    this.cdr.markForCheck();
  }
  
  closeTimesheetModal(): void {
    this.showTimesheetModal = false;
    this.selectedTimesheetEmployee = null;
    this.individualTimesheetRows = [];
    this.cdr.markForCheck();
  }
  
  downloadTimesheetPDF(ts: GeneratedTimesheetSummary): void {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, 297, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE TIMESHEET', 148.5, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${this.generateStartDate} to ${this.generateEndDate}`, 148.5, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information', 14, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Employee ID: ${ts.employeeCode}`, 14, 53);
    doc.text(`Name: ${ts.firstName} ${ts.lastName}`, 14, 60);
    doc.text(`Department: ${ts.department}`, 120, 53);
    doc.text(`Status: ${ts.status}`, 120, 60);
    
    const tableData = ts.records.map((r, idx) => {
      const date = new Date(r.attendanceDate);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return [
        (idx + 1).toString(),
        r.attendanceDate,
        dayName,
        r.clockIn,
        r.clockOut,
        '1:00',
        r.regularHours.toFixed(1),
        r.overtimeHours.toFixed(1),
        (r.regularHours + r.overtimeHours).toFixed(1),
        r.status
      ];
    });
    
    autoTable(doc, {
      startY: 70,
      head: [['#', 'Date', 'Day', 'Clock In', 'Clock Out', 'Lunch', 'Reg Hrs', 'OT Hrs', 'Total', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 102, 153],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255]
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 15 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 15 },
        6: { cellWidth: 18 },
        7: { cellWidth: 18 },
        8: { cellWidth: 18 },
        9: { cellWidth: 25 }
      }
    });
    
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    
    doc.setFillColor(0, 102, 153);
    doc.rect(14, finalY + 10, 269, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 20, finalY + 20);
    
    doc.setFontSize(10);
    doc.text(`Regular Hours: ${ts.totalRegularHours.toFixed(1)}`, 70, finalY + 20);
    doc.text(`Overtime Hours: ${ts.totalOvertimeHours.toFixed(1)}`, 140, finalY + 20);
    doc.text(`Total Hours: ${ts.totalHours.toFixed(1)}`, 210, finalY + 20);
    
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 200);
    doc.text('Hao System - Employee Timesheet', 250, 200);
    
    doc.save(`Timesheet_${ts.employeeCode}_${this.generateStartDate}.pdf`);
    this.showMessage(`Downloaded timesheet PDF for ${ts.firstName} ${ts.lastName}`, 'success');
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
