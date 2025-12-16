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
  loading = true;
  processing = false;
  selectedRecord: PayrollRecord | null = null;
  showDetailModal = false;

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
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading records:', err);
        this.loading = false;
      }
    });
  }

  processPayroll(): void {
    if (!this.payrollRun?.id) return;
    
    if (!confirm('Are you sure you want to process this payroll? This action cannot be undone.')) {
      return;
    }

    this.processing = true;
    this.payrollService.processPayroll(this.payrollRun.id, {}).subscribe({
      next: () => {
        this.processing = false;
        alert('Payroll processed successfully!');
        this.router.navigate(['/app/payroll/calculation']);
      },
      error: (err) => {
        this.processing = false;
        console.error('Error processing payroll:', err);
        alert('Error processing payroll');
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

  goBack(): void {
    this.router.navigate(['/app/payroll/calculation']);
  }
}
