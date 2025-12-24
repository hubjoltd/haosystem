import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../services/payroll.service';

@Component({
  selector: 'app-payroll-run-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-run-details.component.html',
  styleUrls: ['./payroll-run-details.component.scss']
})
export class PayrollRunDetailsComponent implements OnInit {
  payrollRun: PayrollRun | null = null;
  payrollRecords: PayrollRecord[] = [];
  selectedRecords: Map<number, boolean> = new Map();
  
  loading = false;
  processing = false;
  selectAll = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const runId = parseInt(params['runId'], 10);
      this.loadPayrollRunDetails(runId);
    });
  }

  loadPayrollRunDetails(runId: number): void {
    this.loading = true;
    
    this.payrollService.getPayrollRuns().subscribe({
      next: (runs) => {
        this.payrollRun = runs.find(r => r.id === runId) || null;
        
        if (runId) {
          this.payrollService.getPayrollRecordsByRun(runId).subscribe({
            next: (records) => {
              this.payrollRecords = records;
              records.forEach(r => this.selectedRecords.set(r.id || 0, false));
              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading payroll records:', err);
              this.loading = false;
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading payroll run:', err);
        this.loading = false;
      }
    });
  }

  toggleSelectAll(): void {
    this.payrollRecords.forEach(r => {
      this.selectedRecords.set(r.id || 0, this.selectAll);
    });
  }

  toggleRecord(recordId: number): void {
    const current = this.selectedRecords.get(recordId) || false;
    this.selectedRecords.set(recordId, !current);
    this.updateSelectAllState();
  }

  updateSelectAllState(): void {
    const selected = Array.from(this.selectedRecords.values()).filter(v => v).length;
    this.selectAll = selected === this.payrollRecords.length && this.payrollRecords.length > 0;
  }

  getSelectedCount(): number {
    return Array.from(this.selectedRecords.values()).filter(v => v).length;
  }

  processPayroll(): void {
    const selected = this.getSelectedCount();
    if (selected === 0) {
      alert('Please select at least one employee');
      return;
    }

    this.processing = true;
    alert(`Processing payroll for ${selected} selected employee(s)...`);
    
    setTimeout(() => {
      this.processing = false;
      alert('Payroll processed successfully!');
      this.router.navigate(['/app/payroll/calculation']);
    }, 2000);
  }

  getEmployeeName(record: PayrollRecord): string {
    return `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'Unknown';
  }

  getEmployeeCode(record: PayrollRecord): string {
    return record.employee?.employeeCode || 'N/A';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  goBack(): void {
    this.router.navigate(['/app/payroll/calculation']);
  }
}
