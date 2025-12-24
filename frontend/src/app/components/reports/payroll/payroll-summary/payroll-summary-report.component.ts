import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../../services/payroll.service';
import { ReportExportService } from '../../../../services/report-export.service';

interface PayrollSummaryRow {
  groupKey: string;
  groupName: string;
  employeeCount: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalTaxes: number;
  totalNetPay: number;
  totalEmployerContributions: number;
}

@Component({
  selector: 'app-payroll-summary-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-summary-report.component.html',
  styleUrls: ['./payroll-summary-report.component.scss']
})
export class PayrollSummaryReportComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  summaryData: PayrollSummaryRow[] = [];
  
  selectedRunId: number | null = null;
  groupBy: 'employee' | 'department' | 'project' = 'employee';
  
  loading = false;
  
  grandTotals = {
    employeeCount: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalTaxes: 0,
    totalNetPay: 0,
    totalEmployerContributions: 0
  };

  constructor(
    private payrollService: PayrollService,
    private exportService: ReportExportService
  ) {}

  ngOnInit(): void {
    this.loadPayrollRuns();
  }

  loadPayrollRuns(): void {
    this.payrollService.getPayrollRuns().subscribe({
      next: (data) => {
        this.payrollRuns = data.filter(run => run.status === 'PROCESSED' || run.status === 'APPROVED');
        if (this.payrollRuns.length > 0) {
          this.selectedRunId = this.payrollRuns[0].id!;
          this.loadPayrollRecords();
        }
      },
      error: (err) => console.error('Error loading payroll runs:', err)
    });
  }

  loadPayrollRecords(): void {
    if (!this.selectedRunId) return;
    
    this.loading = true;
    this.payrollService.getPayrollRecordsByRun(this.selectedRunId).subscribe({
      next: (data) => {
        this.payrollRecords = data;
        this.generateSummary();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payroll records:', err);
        this.loading = false;
      }
    });
  }

  generateSummary(): void {
    const grouped = new Map<string, PayrollSummaryRow>();
    
    this.payrollRecords.forEach(record => {
      let key: string;
      let name: string;
      
      switch (this.groupBy) {
        case 'department':
          key = record.employee?.department?.id?.toString() || 'unassigned';
          name = record.employee?.department?.name || 'Unassigned';
          break;
        case 'project':
          key = record.projectCode || 'unassigned';
          name = record.projectCode || 'Unassigned';
          break;
        default:
          key = record.employee?.id?.toString() || 'unknown';
          name = `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'Unknown';
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          groupKey: key,
          groupName: name,
          employeeCount: 0,
          totalGrossPay: 0,
          totalDeductions: 0,
          totalTaxes: 0,
          totalNetPay: 0,
          totalEmployerContributions: 0
        });
      }
      
      const row = grouped.get(key)!;
      if (this.groupBy === 'employee') {
        row.employeeCount = 1;
      } else {
        row.employeeCount++;
      }
      row.totalGrossPay += record.grossPay || 0;
      row.totalDeductions += record.totalDeductions || 0;
      row.totalTaxes += record.totalTaxes || 0;
      row.totalNetPay += record.netPay || 0;
      row.totalEmployerContributions += record.totalEmployerContributions || 0;
    });
    
    this.summaryData = Array.from(grouped.values()).sort((a, b) => a.groupName.localeCompare(b.groupName));
    this.calculateGrandTotals();
  }

  calculateGrandTotals(): void {
    this.grandTotals = {
      employeeCount: this.groupBy === 'employee' ? this.summaryData.length : this.summaryData.reduce((sum, row) => sum + row.employeeCount, 0),
      totalGrossPay: this.summaryData.reduce((sum, row) => sum + row.totalGrossPay, 0),
      totalDeductions: this.summaryData.reduce((sum, row) => sum + row.totalDeductions, 0),
      totalTaxes: this.summaryData.reduce((sum, row) => sum + row.totalTaxes, 0),
      totalNetPay: this.summaryData.reduce((sum, row) => sum + row.totalNetPay, 0),
      totalEmployerContributions: this.summaryData.reduce((sum, row) => sum + row.totalEmployerContributions, 0)
    };
  }

  onRunChange(): void {
    this.loadPayrollRecords();
  }

  onGroupByChange(): void {
    this.generateSummary();
  }

  getGroupByLabel(): string {
    switch (this.groupBy) {
      case 'department': return 'Department';
      case 'project': return 'Project';
      default: return 'Employee';
    }
  }

  getSelectedRunInfo(): string {
    const run = this.payrollRuns.find(r => r.id === this.selectedRunId);
    if (!run) return '';
    return `${run.payrollRunNumber} (${this.formatDate(run.periodStartDate)} - ${this.formatDate(run.periodEndDate)})`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  exportToPDF(): void {
    const headers = [this.getGroupByLabel(), 'Employees', 'Gross Pay', 'Deductions', 'Taxes', 'Net Pay', 'Employer Cost'];
    const data = this.summaryData.map(row => [
      row.groupName,
      row.employeeCount.toString(),
      this.formatCurrency(row.totalGrossPay),
      this.formatCurrency(row.totalDeductions),
      this.formatCurrency(row.totalTaxes),
      this.formatCurrency(row.totalNetPay),
      this.formatCurrency(row.totalEmployerContributions)
    ]);
    
    this.exportService.exportToPDF(
      `Payroll Summary Report - By ${this.getGroupByLabel()}`,
      headers,
      data,
      `payroll_summary_${this.groupBy}`
    );
  }

  exportToExcel(): void {
    const data = this.summaryData.map(row => ({
      [this.getGroupByLabel()]: row.groupName,
      'Employee Count': row.employeeCount,
      'Gross Pay': row.totalGrossPay,
      'Deductions': row.totalDeductions,
      'Taxes': row.totalTaxes,
      'Net Pay': row.totalNetPay,
      'Employer Contributions': row.totalEmployerContributions
    }));
    
    this.exportService.exportToExcel(data, `payroll_summary_${this.groupBy}`);
  }

  exportToCSV(): void {
    const headers = [this.getGroupByLabel(), 'Employee Count', 'Gross Pay', 'Deductions', 'Taxes', 'Net Pay', 'Employer Contributions'];
    const data = this.summaryData.map(row => [
      row.groupName,
      row.employeeCount,
      row.totalGrossPay,
      row.totalDeductions,
      row.totalTaxes,
      row.totalNetPay,
      row.totalEmployerContributions
    ]);
    
    this.exportService.exportToCSV(headers, data, `payroll_summary_${this.groupBy}`);
  }
}
