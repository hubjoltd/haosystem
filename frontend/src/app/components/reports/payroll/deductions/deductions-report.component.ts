import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../../services/payroll.service';
import { ReportExportService } from '../../../../services/report-export.service';

interface DeductionRow {
  employeeName: string;
  employeeCode: string;
  department: string;
  healthInsurance: number;
  dental: number;
  vision: number;
  retirement401k: number;
  hsa: number;
  preTax: number;
  postTax: number;
  loans: number;
  garnishments: number;
  totalDeductions: number;
}

@Component({
  selector: 'app-deductions-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './deductions-report.component.html',
  styleUrls: ['./deductions-report.component.scss']
})
export class DeductionsReportComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  deductionData: DeductionRow[] = [];

  selectedRunId: number | null = null;

  loading = false;
  isFirstLoad = true;
  dataReady = false;

  grandTotals = {
    totalPreTax: 0,
    totalPostTax: 0,
    totalLoans: 0,
    totalAllDeductions: 0,
    healthInsurance: 0,
    dental: 0,
    vision: 0,
    retirement401k: 0,
    hsa: 0,
    garnishments: 0
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
        this.payrollRuns = data.filter(run => ['PROCESSED', 'APPROVED', 'CALCULATED', 'PARTIALLY_PROCESSED'].includes(run.status || ''));
        if (this.payrollRuns.length > 0) {
          this.selectedRunId = this.payrollRuns[0].id!;
          this.loadPayrollRecords();
        } else {
          this.completeLoading();
        }
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.completeLoading();
      }
    });
  }

  loadPayrollRecords(): void {
    if (!this.selectedRunId) return;

    this.payrollService.getPayrollRecordsByRun(this.selectedRunId).subscribe({
      next: (data) => {
        this.payrollRecords = data;
        this.generateDeductionData();
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error loading payroll records:', err);
        this.completeLoading();
      }
    });
  }

  generateDeductionData(): void {
    this.deductionData = this.payrollRecords.map(record => {
      const healthInsurance = record.healthInsurance || 0;
      const dental = record.dentalInsurance || 0;
      const vision = record.visionInsurance || 0;
      const retirement401k = record.retirement401k || 0;
      const hsa = record.hsaContribution || 0;
      const preTax = record.preTaxDeductions || 0;
      const postTax = record.postTaxDeductions || 0;
      const loans = record.loanDeductions || 0;
      const garnishments = record.garnishments || 0;
      const totalDeductions = record.totalDeductions || 0;

      return {
        employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'Unknown',
        employeeCode: record.employee?.employeeCode || record.employee?.id?.toString() || '-',
        department: record.employee?.department?.name || 'Unassigned',
        healthInsurance,
        dental,
        vision,
        retirement401k,
        hsa,
        preTax,
        postTax,
        loans,
        garnishments,
        totalDeductions
      };
    }).sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    this.calculateGrandTotals();
  }

  calculateGrandTotals(): void {
    this.grandTotals = {
      totalPreTax: this.deductionData.reduce((sum, row) => sum + row.preTax, 0),
      totalPostTax: this.deductionData.reduce((sum, row) => sum + row.postTax, 0),
      totalLoans: this.deductionData.reduce((sum, row) => sum + row.loans, 0),
      totalAllDeductions: this.deductionData.reduce((sum, row) => sum + row.totalDeductions, 0),
      healthInsurance: this.deductionData.reduce((sum, row) => sum + row.healthInsurance, 0),
      dental: this.deductionData.reduce((sum, row) => sum + row.dental, 0),
      vision: this.deductionData.reduce((sum, row) => sum + row.vision, 0),
      retirement401k: this.deductionData.reduce((sum, row) => sum + row.retirement401k, 0),
      hsa: this.deductionData.reduce((sum, row) => sum + row.hsa, 0),
      garnishments: this.deductionData.reduce((sum, row) => sum + row.garnishments, 0)
    };
  }

  onRunChange(): void {
    this.loadPayrollRecords();
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
    const headers = ['Employee', 'Code', 'Dept', 'Health', 'Dental', 'Vision', '401(k)', 'HSA', 'Pre-Tax', 'Post-Tax', 'Loans', 'Garn.', 'Total'];
    const data = this.deductionData.map(row => [
      row.employeeName,
      row.employeeCode,
      row.department,
      this.formatCurrency(row.healthInsurance),
      this.formatCurrency(row.dental),
      this.formatCurrency(row.vision),
      this.formatCurrency(row.retirement401k),
      this.formatCurrency(row.hsa),
      this.formatCurrency(row.preTax),
      this.formatCurrency(row.postTax),
      this.formatCurrency(row.loans),
      this.formatCurrency(row.garnishments),
      this.formatCurrency(row.totalDeductions)
    ]);

    this.exportService.exportToPDF(
      'Deductions Report',
      headers,
      data,
      'deductions_report'
    );
  }

  exportToExcel(): void {
    const data = this.deductionData.map(row => ({
      'Employee Name': row.employeeName,
      'Code': row.employeeCode,
      'Department': row.department,
      'Health Insurance': row.healthInsurance,
      'Dental': row.dental,
      'Vision': row.vision,
      '401(k)': row.retirement401k,
      'HSA': row.hsa,
      'Pre-Tax Deductions': row.preTax,
      'Post-Tax Deductions': row.postTax,
      'Loan Deductions': row.loans,
      'Garnishments': row.garnishments,
      'Total Deductions': row.totalDeductions
    }));

    this.exportService.exportToExcel(data, 'deductions_report');
  }

  exportToCSV(): void {
    const headers = ['Employee Name', 'Code', 'Department', 'Health Insurance', 'Dental', 'Vision', '401(k)', 'HSA', 'Pre-Tax', 'Post-Tax', 'Loans', 'Garnishments', 'Total Deductions'];
    const data = this.deductionData.map(row => [
      row.employeeName,
      row.employeeCode,
      row.department,
      row.healthInsurance,
      row.dental,
      row.vision,
      row.retirement401k,
      row.hsa,
      row.preTax,
      row.postTax,
      row.loans,
      row.garnishments,
      row.totalDeductions
    ]);

    this.exportService.exportToCSV(headers, data, 'deductions_report');
  }

  completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
    this.isFirstLoad = false;
  }
}
