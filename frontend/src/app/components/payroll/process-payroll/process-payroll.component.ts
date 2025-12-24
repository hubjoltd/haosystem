import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PayrollService, PayrollRun, PayrollRecord } from '../../../services/payroll.service';

@Component({
  selector: 'app-process-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './process-payroll.component.html',
  styleUrls: ['./process-payroll.component.scss']
})
export class ProcessPayrollComponent implements OnInit {
  payrollRun: PayrollRun | null = null;
  payrollRecords: PayrollRecord[] = [];
  selectedRecordIds: Set<number> = new Set();
  loading = true;
  processing = false;
  selectedRecord: PayrollRecord | null = null;
  showDetailModal = false;
  accountPostings: any = null;

  summary = {
    totalGrossPay: 0,
    totalDeductions: 0,
    totalTaxes: 0,
    totalNetPay: 0,
    totalEmployerContributions: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPayrollRun(parseInt(id));
    }
  }

  loadPayrollRun(id: number): void {
    this.loading = true;
    this.payrollService.getPayrollRun(id).subscribe({
      next: (run) => {
        this.payrollRun = run;
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
      totalEmployerContributions: recordsToSum.reduce((sum, r) => sum + (r.totalEmployerContributions || 0), 0)
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
    return (status === 'CALCULATED' || status === 'APPROVED') && 
           (this.selectedRecordIds.size > 0 || this.payrollRecords.some(r => r.status !== 'PROCESSED'));
  }

  processPayroll(): void {
    if (!this.payrollRun?.id || !this.canProcess()) return;
    
    const selectedIds = Array.from(this.selectedRecordIds);
    const count = selectedIds.length > 0 ? selectedIds.length : this.payrollRecords.filter(r => r.status !== 'PROCESSED').length;
    
    if (!confirm(`Are you sure you want to process payroll for ${count} employee(s)? This action will:\n\n• Mark selected records as PROCESSED\n• Post to accounting ledgers\n• Generate pay stubs\n\nThis action cannot be undone.`)) {
      return;
    }

    this.processing = true;
    this.payrollService.processPayroll(this.payrollRun.id, { recordIds: selectedIds }).subscribe({
      next: (response: any) => {
        this.processing = false;
        this.accountPostings = response.accountPostings;
        
        const message = `Successfully processed ${response.processedCount} payroll record(s).\n\n` +
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
    this.router.navigate(['/app/payroll/calculation']);
  }
}
