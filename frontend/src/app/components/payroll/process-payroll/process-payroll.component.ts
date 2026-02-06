import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRun, PayrollRecord } from '../../../services/payroll.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-process-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './process-payroll.component.html',
  styleUrls: ['./process-payroll.component.scss']
})
export class ProcessPayrollComponent implements OnInit, OnDestroy {
  periodType = 'BI_WEEKLY';
  selectedProject = '';
  filterStartDate = '';
  filterEndDate = '';

  employees: Employee[] = [];
  selectedEmployeeIds: Set<number> = new Set();
  selectAllEmployees = true;
  employeeSearchTerm = '';

  payrollRuns: PayrollRun[] = [];
  allPayrollRuns: PayrollRun[] = [];

  currentRun: PayrollRun | null = null;
  payrollRecords: PayrollRecord[] = [];
  selectedRecordIds: Set<number> = new Set();

  loading = false;
  calculating = false;
  processing = false;

  showNewCalcModal = false;
  showRunDetailsModal = false;
  showProcessConfirmModal = false;
  showCalculatedReview = false;

  selectedViewRun: PayrollRun | null = null;
  viewRunRecords: PayrollRecord[] = [];
  viewSelectedIds: Set<number> = new Set();

  bankAccount = '';
  payDate = '';

  calculatedRecords: PayrollRecord[] = [];

  summary = {
    pendingEmployees: 0,
    grossPay: 0,
    netTax: 0,
    netPay: 0
  };

  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadAllPayrollRuns();
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  setDefaultDates(): void {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.filterStartDate = firstOfMonth.toISOString().split('T')[0];
    this.filterEndDate = lastOfMonth.toISOString().split('T')[0];
    this.payDate = today.toISOString().split('T')[0];
  }

  loadAllPayrollRuns(): void {
    this.loading = true;
    this.payrollService.getPayrollRuns().subscribe({
      next: (runs) => {
        this.allPayrollRuns = runs;
        this.payrollRuns = runs;
        this.calculateSummary();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.toastService.error('Error loading payroll runs');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openNewCalcModal(): void {
    this.setDefaultDates();
    this.periodType = 'BI_WEEKLY';
    this.selectedProject = '';
    this.selectedEmployeeIds.clear();
    this.selectAllEmployees = true;
    this.employeeSearchTerm = '';
    this.showNewCalcModal = true;
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (emps) => {
        this.employees = emps.filter((e: Employee) => e.active);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  get filteredEmployees(): Employee[] {
    if (!this.employeeSearchTerm) return this.employees;
    const term = this.employeeSearchTerm.toLowerCase();
    return this.employees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(term) ||
      (e.employeeCode || '').toLowerCase().includes(term) ||
      (e.department?.name || '').toLowerCase().includes(term)
    );
  }

  toggleSelectAllEmployees(): void {
    if (this.selectAllEmployees) {
      this.selectAllEmployees = false;
      this.selectedEmployeeIds.clear();
    } else {
      this.selectAllEmployees = true;
      this.selectedEmployeeIds.clear();
    }
  }

  toggleEmployeeSelection(id: number): void {
    this.selectAllEmployees = false;
    if (this.selectedEmployeeIds.has(id)) {
      this.selectedEmployeeIds.delete(id);
    } else {
      this.selectedEmployeeIds.add(id);
    }
    if (this.selectedEmployeeIds.size === this.employees.length) {
      this.selectAllEmployees = true;
      this.selectedEmployeeIds.clear();
    }
  }

  isEmployeeSelected(id: number): boolean {
    return this.selectAllEmployees || this.selectedEmployeeIds.has(id);
  }

  getSelectedEmployeeCount(): number {
    return this.selectAllEmployees ? this.employees.length : this.selectedEmployeeIds.size;
  }

  closeNewCalcModal(): void {
    this.showNewCalcModal = false;
  }

  submitNewCalc(): void {
    if (!this.filterStartDate || !this.filterEndDate) {
      this.toastService.error('Please select start and end dates');
      return;
    }

    if (!this.payDate) {
      this.payDate = this.filterEndDate;
    }

    this.calculating = true;

    const runData = {
      description: this.selectedProject || 'Company Level',
      periodType: this.periodType,
      projectCode: this.selectedProject || null,
      periodStartDate: this.filterStartDate,
      periodEndDate: this.filterEndDate,
      payDate: this.payDate || null
    };

    const employeeIds = this.selectAllEmployees ? [] : Array.from(this.selectedEmployeeIds);

    this.payrollService.createPayrollRun(runData).subscribe({
      next: (run) => {
        this.currentRun = run;
        if (run.id) {
          this.payrollService.calculatePayroll(run.id, employeeIds).subscribe({
            next: (calculatedRun) => {
              this.currentRun = calculatedRun;
              this.payrollService.getPayrollRecordsByRun(run.id!).subscribe({
                next: (records) => {
                  this.calculatedRecords = records;
                  this.showCalculatedReview = true;
                  this.showNewCalcModal = false;
                  this.calculating = false;
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error('Error loading records:', err);
                  this.calculating = false;
                  this.showNewCalcModal = false;
                  this.toastService.error('Payroll calculated but failed to load records');
                }
              });
            },
            error: (err) => {
              console.error('Error calculating payroll:', err);
              this.calculating = false;
              this.toastService.error('Error calculating payroll: ' + (err.error?.error || err.error?.message || err.message || 'Unknown error'));
            }
          });
        } else {
          this.calculating = false;
          this.toastService.error('Payroll run created but no ID returned. Please try again.');
        }
      },
      error: (err) => {
        console.error('Error creating payroll run:', err);
        this.calculating = false;
        this.toastService.error('Error creating payroll run: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  saveCalculatedPayroll(): void {
    this.showCalculatedReview = false;
    this.calculatedRecords = [];
    this.currentRun = null;
    this.loadAllPayrollRuns();
    this.toastService.success('Payroll saved successfully');
  }

  cancelCalculatedReview(): void {
    this.showCalculatedReview = false;
    this.calculatedRecords = [];
    this.currentRun = null;
  }

  viewRunDetails(run: PayrollRun): void {
    this.selectedViewRun = run;
    this.viewSelectedIds.clear();
    this.showRunDetailsModal = true;

    if (run.id) {
      this.payrollService.getPayrollRecordsByRun(run.id).subscribe({
        next: (records) => {
          this.viewRunRecords = records;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading run records:', err);
          this.toastService.error('Failed to load payroll records');
        }
      });
    }
  }

  closeRunDetailsModal(): void {
    this.showRunDetailsModal = false;
    this.selectedViewRun = null;
    this.viewRunRecords = [];
    this.viewSelectedIds.clear();
  }

  toggleViewSelectAll(event: any): void {
    if (event.target.checked) {
      this.viewRunRecords.forEach(r => {
        if (r.id && r.status !== 'PROCESSED') {
          this.viewSelectedIds.add(r.id);
        }
      });
    } else {
      this.viewSelectedIds.clear();
    }
    this.cdr.detectChanges();
  }

  toggleViewRecord(record: PayrollRecord): void {
    if (record.id) {
      if (this.viewSelectedIds.has(record.id)) {
        this.viewSelectedIds.delete(record.id);
      } else {
        this.viewSelectedIds.add(record.id);
      }
      this.cdr.detectChanges();
    }
  }

  isViewSelected(record: PayrollRecord): boolean {
    return record.id ? this.viewSelectedIds.has(record.id) : false;
  }

  isViewAllSelected(): boolean {
    const processable = this.viewRunRecords.filter(r => r.status !== 'PROCESSED');
    return processable.length > 0 && processable.every(r => r.id && this.viewSelectedIds.has(r.id));
  }

  openProcessConfirmModal(): void {
    const count = this.viewSelectedIds.size > 0 ? this.viewSelectedIds.size : this.getViewUnprocessedCount();
    if (count === 0) {
      this.toastService.error('No employees to process');
      return;
    }
    this.payDate = new Date().toISOString().split('T')[0];
    this.bankAccount = '';
    this.showProcessConfirmModal = true;
  }

  closeProcessConfirmModal(): void {
    this.showProcessConfirmModal = false;
  }

  confirmAndProcess(): void {
    if (!this.selectedViewRun?.id) return;

    if (!this.payDate) {
      this.toastService.error('Please select a pay date');
      return;
    }

    const selectedIds = Array.from(this.viewSelectedIds).filter(id => {
      const record = this.viewRunRecords.find(r => r.id === id);
      return record && record.status !== 'PROCESSED';
    });

    const count = selectedIds.length > 0 ? selectedIds.length : this.getViewUnprocessedCount();

    this.processing = true;
    this.payrollService.processPayroll(this.selectedViewRun.id, {
      recordIds: selectedIds,
      payDate: this.payDate
    }).subscribe({
      next: (response: any) => {
        this.processing = false;
        this.showProcessConfirmModal = false;
        this.toastService.success(`Successfully processed payroll for ${response.processedCount || count} employee(s)`);
        this.viewSelectedIds.clear();
        if (this.selectedViewRun?.id) {
          this.payrollService.getPayrollRecordsByRun(this.selectedViewRun.id).subscribe({
            next: (records) => {
              this.viewRunRecords = records;
              this.loadAllPayrollRuns();
              this.cdr.detectChanges();
            }
          });
        }
      },
      error: (err) => {
        this.processing = false;
        console.error('Error processing payroll:', err);
        this.toastService.error('Error processing payroll: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  getViewUnprocessedCount(): number {
    return this.viewRunRecords.filter(r => r.status !== 'PROCESSED').length;
  }

  getProcessedCount(run: PayrollRun): number {
    return run.processedCount || 0;
  }

  getProcessedFraction(run: PayrollRun): string {
    const total = run.totalEmployees || 0;
    const processed = this.getProcessedCount(run);
    return `${processed}/${total}`;
  }

  calculateSummary(): void {
    let pendingEmployees = 0;
    let grossPay = 0;
    let netTax = 0;
    let netPay = 0;

    this.allPayrollRuns.forEach(run => {
      pendingEmployees += run.totalEmployees || 0;
      grossPay += run.totalGrossPay || 0;
      netTax += run.totalTaxes || 0;
      netPay += run.totalNetPay || 0;
    });

    this.summary = { pendingEmployees, grossPay, netTax, netPay };
  }

  getEmployeeName(record: PayrollRecord): string {
    if (record.employee) {
      return `${record.employee.firstName || ''} ${record.employee.lastName || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  }

  getEmployeeCode(record: PayrollRecord): string {
    return record.employee?.employeeCode || 'N/A';
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CALCULATED': return 'status-calculated';
      case 'APPROVED': return 'status-approved';
      case 'PROCESSED':
      case 'FULLY_PROCESSED':
      case 'COMPLETED': return 'status-processed';
      case 'PARTIALLY_PROCESSED': return 'status-partial';
      default: return 'status-pending';
    }
  }

  getPeriodLabel(): string {
    const types: {[key: string]: string} = {
      'BI_WEEKLY': 'Bi-Weekly',
      'WEEKLY': 'Weekly',
      'MONTHLY': 'Monthly',
      'SEMI_MONTHLY': 'Semi-Monthly'
    };
    return types[this.periodType] || this.periodType;
  }

  getPeriodTypeLabel(periodType: any): string {
    if (!periodType) return 'Regular';
    const types: {[key: string]: string} = {
      'BI_WEEKLY': 'Bi-Weekly',
      'WEEKLY': 'Weekly',
      'MONTHLY': 'Monthly',
      'SEMI_MONTHLY': 'Semi-Monthly'
    };
    if (typeof periodType === 'string') {
      return types[periodType] || String(periodType);
    }
    if (periodType?.code) {
      return types[periodType.code] || periodType.name || String(periodType.code);
    }
    return String(periodType);
  }

  getPeriodTypeBadgeClass(periodType: any): string {
    const label = this.getPeriodTypeLabel(periodType);
    if (label === 'Bi-Weekly') return 'badge-teal';
    if (label === 'Weekly') return 'badge-blue';
    if (label === 'Monthly') return 'badge-purple';
    if (label === 'Semi-Monthly') return 'badge-orange';
    return 'badge-teal';
  }

  isProcessedFractionGreen(run: PayrollRun): boolean {
    return this.getProcessedCount(run) > 0;
  }

  getViewRecordTotalGross(): number {
    return this.viewRunRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0);
  }

  getViewRecordTotalFederal(): number {
    return this.viewRunRecords.reduce((sum, r) => sum + (r.federalTax || 0), 0);
  }

  getViewRecordTotalState(): number {
    return this.viewRunRecords.reduce((sum, r) => sum + (r.stateTax || 0), 0);
  }

  getViewRecordTotalSocSec(): number {
    return this.viewRunRecords.reduce((sum, r) => sum + (r.socialSecurityTax || 0), 0);
  }

  getViewRecordTotalMedicare(): number {
    return this.viewRunRecords.reduce((sum, r) => sum + (r.medicareTax || 0), 0);
  }

  getViewRecordTotalTax(): number {
    return this.viewRunRecords.reduce((sum, r) => {
      return sum + (r.totalTaxes || ((r.federalTax || 0) + (r.stateTax || 0) + (r.socialSecurityTax || 0) + (r.medicareTax || 0)));
    }, 0);
  }

  getViewRecordTotalNet(): number {
    return this.viewRunRecords.reduce((sum, r) => sum + (r.netPay || 0), 0);
  }

  getRecordTotalTax(record: PayrollRecord): number {
    return (record.totalTaxes || ((record.federalTax || 0) + (record.stateTax || 0) + (record.socialSecurityTax || 0) + (record.medicareTax || 0)));
  }

  getRecordHours(record: PayrollRecord): number {
    return (record.regularHours || 0) + (record.overtimeHours || 0);
  }

  downloadPayslip(record: PayrollRecord): void {
    const doc = new jsPDF();
    const employeeName = this.getEmployeeName(record);
    const employeeCode = this.getEmployeeCode(record);

    doc.setFontSize(20);
    doc.setTextColor(0, 121, 107);
    doc.text('PAY STUB', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pay Period: ${this.currentRun?.periodStartDate || this.selectedViewRun?.periodStartDate || ''} to ${this.currentRun?.periodEndDate || this.selectedViewRun?.periodEndDate || ''}`, 105, 30, { align: 'center' });

    doc.line(20, 35, 190, 35);

    doc.setFontSize(10);
    doc.text(`Employee: ${employeeName}`, 20, 45);
    doc.text(`ID: ${employeeCode}`, 20, 52);
    doc.text(`Pay Date: ${this.currentRun?.payDate || this.selectedViewRun?.payDate || this.payDate || 'N/A'}`, 120, 45);

    let y = 65;
    doc.setFontSize(11);
    doc.text('EARNINGS', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text('Base Pay:', 25, y);
    doc.text(`$${(record.basePay || 0).toFixed(2)}`, 170, y, { align: 'right' });
    y += 7;
    doc.text('Overtime Pay:', 25, y);
    doc.text(`$${(record.overtimePay || 0).toFixed(2)}`, 170, y, { align: 'right' });
    y += 10;
    doc.text('Gross Pay:', 25, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${(record.grossPay || 0).toFixed(2)}`, 170, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 15;
    doc.setFontSize(11);
    doc.text('DEDUCTIONS', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text('Federal Tax:', 25, y);
    doc.text(`-$${(record.federalTax || 0).toFixed(2)}`, 170, y, { align: 'right' });
    y += 7;
    doc.text('State Tax:', 25, y);
    doc.text(`-$${(record.stateTax || 0).toFixed(2)}`, 170, y, { align: 'right' });
    y += 7;
    doc.text('Social Security:', 25, y);
    doc.text(`-$${(record.socialSecurityTax || 0).toFixed(2)}`, 170, y, { align: 'right' });
    y += 7;
    doc.text('Medicare:', 25, y);
    doc.text(`-$${(record.medicareTax || 0).toFixed(2)}`, 170, y, { align: 'right' });
    y += 10;
    doc.text('Total Deductions:', 25, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`-$${(record.totalDeductions || 0).toFixed(2)}`, 170, y, { align: 'right' });

    y += 20;
    doc.setFontSize(14);
    doc.setTextColor(0, 121, 107);
    doc.text('NET PAY:', 25, y);
    doc.text(`$${(record.netPay || 0).toFixed(2)}`, 170, y, { align: 'right' });

    doc.save(`paystub_${employeeCode}_${this.selectedViewRun?.periodEndDate || this.currentRun?.periodEndDate || 'payroll'}.pdf`);
  }
}
