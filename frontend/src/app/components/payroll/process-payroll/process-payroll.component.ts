import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRun, PayrollRecord } from '../../../services/payroll.service';
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
  payrollRuns: PayrollRun[] = [];
  payrollRun: PayrollRun | null = null;
  payrollRecords: PayrollRecord[] = [];
  selectedRecordIds: Set<number> = new Set();
  loading = false;
  processing = false;
  selectedRecord: PayrollRecord | null = null;
  showDetailModal = false;
  accountPostings: any = null;
  viewMode: 'list' | 'detail' = 'list';
  private routeSub: Subscription | null = null;
  
  payDate: string = '';
  showPayDateError = false;

  summary = {
    totalGrossPay: 0,
    totalDeductions: 0,
    totalTaxes: 0,
    totalNetPay: 0,
    totalEmployerContributions: 0,
    totalBasePay: 0,
    totalOvertimePay: 0,
    totalReimbursements: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.viewMode = 'detail';
        this.loadPayrollRun(parseInt(id));
      } else {
        this.viewMode = 'list';
        this.payrollRun = null;
        this.payrollRecords = [];
        this.loadPayrollRuns();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadPayrollRuns(): void {
    this.loading = true;
    this.payrollService.getPayrollRuns().subscribe({
      next: (runs) => {
        this.payrollRuns = runs.filter(r => r.status === 'APPROVED' || r.status === 'CALCULATED');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.loading = false;
      }
    });
  }

  selectRun(run: PayrollRun): void {
    if (run.id) {
      this.router.navigate(['/app/payroll/process', run.id]);
    }
  }

  loadPayrollRun(id: number): void {
    this.loading = true;
    this.payrollService.getPayrollRun(id).subscribe({
      next: (run) => {
        this.payrollRun = run;
        this.payDate = run.payDate || '';
        this.showPayDateError = false;
        this.loadPayrollRecords(id);
      },
      error: (err) => {
        console.error('Error loading payroll run:', err);
        this.loading = false;
      }
    });
  }

  loadPayrollRecords(runId: number): void {
    this.payrollService.getPayrollRecordsByRun(runId).subscribe({
      next: (records) => {
        this.payrollRecords = records;
        this.calculateSummary();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading records:', err);
        this.loading = false;
      }
    });
  }

  calculateSummary(): void {
    const selectedRecords = this.getSelectedRecords();
    const recordsToSum = selectedRecords.length > 0 ? selectedRecords : this.payrollRecords;
    
    this.summary = {
      totalGrossPay: recordsToSum.reduce((sum, r) => sum + (r.grossPay || 0), 0),
      totalDeductions: recordsToSum.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
      totalTaxes: recordsToSum.reduce((sum, r) => sum + (r.totalTaxes || 0), 0),
      totalNetPay: recordsToSum.reduce((sum, r) => sum + (r.netPay || 0), 0),
      totalEmployerContributions: recordsToSum.reduce((sum, r) => sum + (r.totalEmployerContributions || 0), 0),
      totalBasePay: recordsToSum.reduce((sum, r) => sum + (r.basePay || 0), 0),
      totalOvertimePay: recordsToSum.reduce((sum, r) => sum + (r.overtimePay || 0), 0),
      totalReimbursements: recordsToSum.reduce((sum, r) => sum + (r.reimbursements || 0), 0)
    };
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.payrollRecords.forEach(r => {
        if (r.id && r.status !== 'PROCESSED') {
          this.selectedRecordIds.add(r.id);
        }
      });
    } else {
      this.selectedRecordIds.clear();
    }
    this.calculateSummary();
  }

  toggleRecord(record: PayrollRecord): void {
    if (record.id) {
      if (this.selectedRecordIds.has(record.id)) {
        this.selectedRecordIds.delete(record.id);
      } else {
        this.selectedRecordIds.add(record.id);
      }
      this.calculateSummary();
    }
  }

  isSelected(record: PayrollRecord): boolean {
    return record.id ? this.selectedRecordIds.has(record.id) : false;
  }

  isAllSelected(): boolean {
    const processableRecords = this.payrollRecords.filter(r => r.status !== 'PROCESSED');
    return processableRecords.length > 0 && 
           processableRecords.every(r => r.id && this.selectedRecordIds.has(r.id));
  }

  getSelectedRecords(): PayrollRecord[] {
    return this.payrollRecords.filter(r => r.id && this.selectedRecordIds.has(r.id));
  }

  canProcess(): boolean {
    if (!this.payrollRun) return false;
    const status = this.payrollRun.status;
    const hasPayDate = !!this.payDate;
    const hasUnprocessedRecords = this.selectedRecordIds.size > 0 || this.payrollRecords.some(r => r.status !== 'PROCESSED');
    return (status === 'CALCULATED' || status === 'APPROVED') && hasPayDate && hasUnprocessedRecords;
  }

  getUnprocessedRecordsCount(): number {
    if (this.selectedRecordIds.size > 0) {
      return this.payrollRecords.filter(r => r.id && this.selectedRecordIds.has(r.id) && r.status !== 'PROCESSED').length;
    }
    return this.payrollRecords.filter(r => r.status !== 'PROCESSED').length;
  }

  getProcessedRecordsCount(): number {
    return this.payrollRecords.filter(r => r.status === 'PROCESSED').length;
  }

  processPayroll(): void {
    if (!this.payrollRun?.id) return;
    
    if (!this.payDate) {
      this.showPayDateError = true;
      alert('Please enter a Pay Date before processing payroll.');
      return;
    }
    this.showPayDateError = false;
    
    const unprocessedCount = this.getUnprocessedRecordsCount();
    if (unprocessedCount === 0) {
      alert('All records have already been processed. No duplicates allowed.');
      return;
    }
    
    const selectedIds = Array.from(this.selectedRecordIds).filter(id => {
      const record = this.payrollRecords.find(r => r.id === id);
      return record && record.status !== 'PROCESSED';
    });
    
    const count = selectedIds.length > 0 ? selectedIds.length : unprocessedCount;
    
    if (!confirm(`Are you sure you want to process payroll for ${count} employee(s)?\n\nPay Date: ${this.payDate}\n\nThis action will:\n• Mark selected records as PROCESSED\n• Post to accounting ledgers\n• Generate pay stubs\n\nThis action cannot be undone.`)) {
      return;
    }

    this.processing = true;
    this.payrollService.processPayroll(this.payrollRun.id, { 
      recordIds: selectedIds,
      payDate: this.payDate 
    }).subscribe({
      next: (response: any) => {
        this.processing = false;
        this.accountPostings = response.accountPostings;
        
        const message = `Successfully processed ${response.processedCount} payroll record(s).\n\n` +
          `Pay Date: ${this.payDate}\n\n` +
          `Account Postings:\n` +
          `• Salary Expenses: $${response.totalGrossPay?.toFixed(2) || '0.00'}\n` +
          `• Employer Contributions: $${response.totalEmployerContributions?.toFixed(2) || '0.00'}\n` +
          `• Tax Liabilities: $${response.totalTaxes?.toFixed(2) || '0.00'}\n` +
          `• Net Payable: $${response.totalNetPay?.toFixed(2) || '0.00'}`;
        
        alert(message);
        this.selectedRecordIds.clear();
        this.loadPayrollRun(this.payrollRun!.id!);
      },
      error: (err) => {
        this.processing = false;
        console.error('Error processing payroll:', err);
        alert('Error processing payroll: ' + (err.error?.error || 'Unknown error'));
      }
    });
  }

  viewRecordDetails(record: PayrollRecord): void {
    this.selectedRecord = record;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedRecord = null;
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
    switch (status) {
      case 'CALCULATED': return 'status-calculated';
      case 'APPROVED': return 'status-approved';
      case 'PROCESSED': return 'status-processed';
      default: return 'status-draft';
    }
  }

  goBack(): void {
    if (this.viewMode === 'detail') {
      this.router.navigate(['/app/payroll/process']);
    } else {
      this.router.navigate(['/app/payroll/timesheets']);
    }
  }

  downloadPayslip(record: PayrollRecord): void {
    const doc = new jsPDF();
    const employeeName = this.getEmployeeName(record);
    const employeeCode = this.getEmployeeCode(record);
    
    doc.setFontSize(20);
    doc.setTextColor(0, 121, 107);
    doc.text('PAYSLIP', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pay Period: ${this.payrollRun?.periodStartDate || ''} to ${this.payrollRun?.periodEndDate || ''}`, 105, 30, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(11);
    doc.text('Employee Details', 20, 45);
    doc.setFontSize(10);
    doc.text(`Name: ${employeeName}`, 20, 55);
    doc.text(`Employee ID: ${employeeCode}`, 20, 62);
    doc.text(`Pay Date: ${this.payrollRun?.payDate || 'N/A'}`, 120, 55);
    doc.text(`Status: ${record.status}`, 120, 62);
    
    doc.line(20, 70, 190, 70);
    
    let y = 80;
    doc.setFontSize(11);
    doc.setTextColor(0, 121, 107);
    doc.text('EARNINGS', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    y += 10;
    doc.text('Base Pay:', 25, y);
    doc.text(`$${(record.basePay || 0).toFixed(2)}`, 170, y, { align: 'right' });
    
    y += 7;
    doc.text('Overtime Pay:', 25, y);
    doc.text(`$${(record.overtimePay || 0).toFixed(2)}`, 170, y, { align: 'right' });
    
    y += 7;
    doc.text('Bonuses:', 25, y);
    doc.text(`$${(record.bonuses || 0).toFixed(2)}`, 170, y, { align: 'right' });
    
    y += 7;
    doc.text('Reimbursements:', 25, y);
    doc.text(`$${(record.reimbursements || 0).toFixed(2)}`, 170, y, { align: 'right' });
    
    y += 10;
    doc.setFontSize(11);
    doc.text('Gross Pay:', 25, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${(record.grossPay || 0).toFixed(2)}`, 170, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    y += 15;
    doc.setFontSize(11);
    doc.setTextColor(0, 121, 107);
    doc.text('DEDUCTIONS', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    y += 10;
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
    
    y += 7;
    doc.text('Health Insurance:', 25, y);
    doc.text(`-$${(record.healthInsurance || 0).toFixed(2)}`, 170, y, { align: 'right' });
    
    y += 7;
    doc.text('401(k) Contribution:', 25, y);
    doc.text(`-$${(record.retirement401k || 0).toFixed(2)}`, 170, y, { align: 'right' });
    
    y += 10;
    doc.setFontSize(11);
    doc.text('Total Deductions:', 25, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`-$${(record.totalDeductions || 0).toFixed(2)}`, 170, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    y += 20;
    doc.setLineWidth(1);
    doc.line(20, y - 5, 190, y - 5);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 121, 107);
    doc.text('NET PAY:', 25, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${(record.netPay || 0).toFixed(2)}`, 170, y + 5, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated document. No signature is required.', 105, 280, { align: 'center' });
    
    doc.save(`payslip_${employeeCode}_${this.payrollRun?.periodEndDate || 'unknown'}.pdf`);
  }
}
