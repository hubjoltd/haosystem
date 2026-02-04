import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  // Filter form
  periodType = 'BI_WEEKLY';
  selectedProject = '';
  filterStartDate = '';
  filterEndDate = '';

  // Saved runs list
  payrollRuns: PayrollRun[] = [];
  
  // Current calculated payroll
  currentRun: PayrollRun | null = null;
  payrollRecords: PayrollRecord[] = [];
  selectedRecordIds: Set<number> = new Set();
  
  // UI State
  loading = false;
  calculating = false;
  processing = false;
  showProcessModal = false;
  showPayStubModal = false;
  selectedRecord: PayrollRecord | null = null;
  
  // Process modal
  payDate = '';
  
  // Summary
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
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
  }

  loadPayrollRuns(): void {
    this.loading = true;
    this.payrollService.getPayrollRuns().subscribe({
      next: (runs) => {
        this.payrollRuns = runs.filter(r => {
          const status = r.status?.toUpperCase();
          return status === 'CALCULATED' || status === 'APPROVED' || status === 'PARTIALLY_PROCESSED';
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.loading = false;
      }
    });
  }

  calculatePayroll(): void {
    if (!this.filterStartDate || !this.filterEndDate) {
      alert('Please select start and end dates');
      return;
    }

    this.calculating = true;
    
    const runData = {
      periodType: this.periodType,
      projectCode: this.selectedProject || null,
      periodStartDate: this.filterStartDate,
      periodEndDate: this.filterEndDate
    };

    this.payrollService.createPayrollRun(runData).subscribe({
      next: (run) => {
        this.currentRun = run;
        // Auto-calculate after creating
        if (run.id) {
          this.payrollService.calculatePayroll(run.id).subscribe({
            next: (calculatedRun) => {
              this.currentRun = calculatedRun;
              this.loadPayrollRecords(run.id!);
              this.calculating = false;
              this.loadPayrollRuns(); // Refresh saved runs list
            },
            error: (err) => {
              console.error('Error calculating payroll:', err);
              this.calculating = false;
              alert('Error calculating payroll: ' + (err.error?.message || 'Unknown error'));
            }
          });
        } else {
          // Handle case where run.id is not returned
          this.calculating = false;
          alert('Payroll run created but no ID returned. Please try again.');
        }
      },
      error: (err) => {
        console.error('Error creating payroll run:', err);
        this.calculating = false;
        alert('Error creating payroll run: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  selectSavedRun(run: PayrollRun): void {
    this.currentRun = run;
    if (run.id) {
      this.loadPayrollRecords(run.id);
    }
  }

  loadPayrollRecords(runId: number): void {
    this.loading = true;
    this.payrollService.getPayrollRecordsByRun(runId).subscribe({
      next: (records) => {
        this.payrollRecords = records;
        this.calculateSummary();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading records:', err);
        this.loading = false;
      }
    });
  }

  calculateSummary(): void {
    const pendingRecords = this.payrollRecords.filter(r => r.status !== 'PROCESSED');
    this.summary = {
      pendingEmployees: pendingRecords.length,
      grossPay: pendingRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0),
      netTax: pendingRecords.reduce((sum, r) => {
        // Use totalTaxes if available, otherwise sum individual tax fields
        const taxes = r.totalTaxes || 
          ((r.federalTax || 0) + (r.stateTax || 0) + (r.socialSecurityTax || 0) + (r.medicareTax || 0));
        return sum + taxes;
      }, 0),
      netPay: pendingRecords.reduce((sum, r) => sum + (r.netPay || 0), 0)
    };
  }

  // Selection
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
    this.cdr.detectChanges();
  }

  toggleRecord(record: PayrollRecord): void {
    if (record.id) {
      if (this.selectedRecordIds.has(record.id)) {
        this.selectedRecordIds.delete(record.id);
      } else {
        this.selectedRecordIds.add(record.id);
      }
      this.cdr.detectChanges();
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

  getUnprocessedCount(): number {
    return this.payrollRecords.filter(r => r.status !== 'PROCESSED').length;
  }

  // Step 4: Open Process Modal
  openProcessModal(): void {
    const count = this.selectedRecordIds.size > 0 ? this.selectedRecordIds.size : this.getUnprocessedCount();
    if (count === 0) {
      alert('No employees to process');
      return;
    }
    this.payDate = '';
    this.showProcessModal = true;
  }

  closeProcessModal(): void {
    this.showProcessModal = false;
    this.payDate = '';
  }

  // Step 4: Process Payroll with Pay Date
  processPayroll(): void {
    if (!this.currentRun?.id) return;
    
    if (!this.payDate) {
      alert('Please select a pay date');
      return;
    }

    const selectedIds = Array.from(this.selectedRecordIds).filter(id => {
      const record = this.payrollRecords.find(r => r.id === id);
      return record && record.status !== 'PROCESSED';
    });

    const count = selectedIds.length > 0 ? selectedIds.length : this.getUnprocessedCount();

    this.processing = true;
    this.payrollService.processPayroll(this.currentRun.id, {
      recordIds: selectedIds,
      payDate: this.payDate
    }).subscribe({
      next: (response: any) => {
        this.processing = false;
        this.showProcessModal = false;
        
        alert(`Successfully processed payroll for ${response.processedCount || count} employee(s).\nPay Date: ${this.payDate}`);
        
        // Refresh data and go to history
        this.selectedRecordIds.clear();
        this.router.navigate(['/app/payroll/history']);
      },
      error: (err) => {
        this.processing = false;
        console.error('Error processing payroll:', err);
        alert('Error processing payroll: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  // Clear current run and go back to filter form
  clearCurrentRun(): void {
    this.currentRun = null;
    this.payrollRecords = [];
    this.selectedRecordIds.clear();
    this.loadPayrollRuns();
  }

  // View Pay Stub
  viewPayStub(record: PayrollRecord): void {
    this.selectedRecord = record;
    this.showPayStubModal = true;
  }

  closePayStubModal(): void {
    this.showPayStubModal = false;
    this.selectedRecord = null;
  }

  // Helpers
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

  // Download Payslip
  downloadPayslip(record: PayrollRecord): void {
    const doc = new jsPDF();
    const employeeName = this.getEmployeeName(record);
    const employeeCode = this.getEmployeeCode(record);
    
    doc.setFontSize(20);
    doc.setTextColor(0, 121, 107);
    doc.text('PAY STUB', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pay Period: ${this.currentRun?.periodStartDate || ''} to ${this.currentRun?.periodEndDate || ''}`, 105, 30, { align: 'center' });
    
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(10);
    doc.text(`Employee: ${employeeName}`, 20, 45);
    doc.text(`ID: ${employeeCode}`, 20, 52);
    doc.text(`Pay Date: ${this.currentRun?.payDate || this.payDate || 'N/A'}`, 120, 45);
    
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
    
    doc.save(`paystub_${employeeCode}_${this.currentRun?.periodEndDate || 'payroll'}.pdf`);
  }
}
