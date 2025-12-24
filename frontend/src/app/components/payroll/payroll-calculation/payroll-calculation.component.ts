import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService, PayrollRun, PayFrequency, PayrollRecord } from '../../../services/payroll.service';
import { TimesheetGenerationDialogComponent } from '../timesheet-generation-dialog/timesheet-generation-dialog.component';

@Component({
  selector: 'app-payroll-calculation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TimesheetGenerationDialogComponent],
  templateUrl: './payroll-calculation.component.html',
  styleUrls: ['./payroll-calculation.component.scss']
})
export class PayrollCalculationComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payFrequencies: PayFrequency[] = [];
  
  showCreateModal = false;
  showTimesheetDialog = false;
  showDetailsModal = false;
  selectedRecord: PayrollRecord | null = null;
  selectedRunRecords: PayrollRecord[] = [];
  selectedRun: PayrollRun | null = null;
  loadingDetails = false;
  
  newRun: any = {};
  creating = false;
  calculating = false;

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadPayrollRuns();
    this.loadPayFrequencies();
    this.resetNewRun();
  }

  resetNewRun(): void {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.newRun = {
      payrollRunNumber: `PR-${Date.now()}`,
      description: `Payroll for ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`,
      periodStartDate: firstOfMonth.toISOString().split('T')[0],
      periodEndDate: lastOfMonth.toISOString().split('T')[0],
      payDate: lastOfMonth.toISOString().split('T')[0]
    };
  }

  loadPayrollRuns(): void {
    this.payrollService.getPayrollRuns().subscribe({
      next: (data) => this.payrollRuns = data,
      error: (err) => console.error('Error loading payroll runs:', err)
    });
  }

  loadPayFrequencies(): void {
    this.payrollService.getPayFrequencies().subscribe({
      next: (data) => this.payFrequencies = data,
      error: (err) => console.error('Error loading frequencies:', err)
    });
  }

  openCreateModal(): void {
    this.resetNewRun();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createPayrollRun(): void {
    this.creating = true;
    this.payrollService.createPayrollRun(this.newRun).subscribe({
      next: () => {
        this.creating = false;
        this.closeCreateModal();
        this.loadPayrollRuns();
      },
      error: (err) => {
        this.creating = false;
        console.error('Error creating payroll run:', err);
      }
    });
  }

  calculatePayroll(run: PayrollRun): void {
    if (!run.id) return;
    
    this.calculating = true;
    this.payrollService.calculatePayroll(run.id).subscribe({
      next: () => {
        this.calculating = false;
        this.loadPayrollRuns();
        alert('Payroll calculated successfully!');
      },
      error: (err) => {
        this.calculating = false;
        console.error('Error calculating payroll:', err);
        alert('Error calculating payroll');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CALCULATED': return 'calculated';
      case 'APPROVED': return 'approved';
      case 'PROCESSED': return 'processed';
      case 'CALCULATING': return 'calculating';
      default: return 'draft';
    }
  }

  canCalculate(run: PayrollRun): boolean {
    return run.status === 'DRAFT';
  }

  openTimesheetDialog(): void {
    this.showTimesheetDialog = true;
  }

  closeTimesheetDialog(): void {
    this.showTimesheetDialog = false;
  }

  onTimesheetsGenerated(event: any): void {
    console.log('Timesheets generated:', event);
    this.showTimesheetDialog = false;
    this.loadPayrollRuns();
    if (event.type === 'attendance') {
      alert(`Successfully generated ${event.count || 0} attendance timesheet(s) from approved records.`);
    } else if (event.type === 'project') {
      alert(`Successfully created project timesheet for ${event.employeeName || 'employee'}.`);
    }
  }

  openDetailsModal(run: PayrollRun): void {
    this.selectedRun = run;
    this.showDetailsModal = true;
    this.loadingDetails = true;
    
    if (run.id) {
      this.payrollService.getPayrollRecordsByRun(run.id).subscribe({
        next: (records) => {
          this.selectedRunRecords = records;
          this.loadingDetails = false;
        },
        error: (err) => {
          console.error('Error loading payroll records:', err);
          this.loadingDetails = false;
          this.selectedRunRecords = [];
        }
      });
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRecord = null;
    this.selectedRun = null;
    this.selectedRunRecords = [];
  }

  openEmployeeDetails(record: PayrollRecord): void {
    this.selectedRecord = record;
  }

  closeEmployeeDetails(): void {
    this.selectedRecord = null;
  }

  getEmployeeName(record: PayrollRecord): string {
    return `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'Unknown';
  }

  getEmployeeCode(record: PayrollRecord): string {
    return record.employee?.employeeCode || 'N/A';
  }

  getDepartment(record: PayrollRecord): string {
    return record.employee?.department?.name || 'N/A';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }
}
