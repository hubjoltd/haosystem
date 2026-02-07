import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../../services/payroll.service';
import { ReportExportService } from '../../../../services/report-export.service';

interface TaxLiabilityRow {
  employeeName: string;
  employeeCode: string;
  department: string;
  federalTax: number;
  stateTax: number;
  localTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  disabilityTax: number;
  totalTaxes: number;
}

@Component({
  selector: 'app-tax-liability-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './tax-liability-report.component.html',
  styleUrls: ['./tax-liability-report.component.scss']
})
export class TaxLiabilityReportComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  taxData: TaxLiabilityRow[] = [];

  selectedRunId: number | null = null;

  loading = false;
  isFirstLoad = true;
  dataReady = false;

  grandTotals = {
    federalTax: 0,
    stateTax: 0,
    localTax: 0,
    socialSecurityTax: 0,
    medicareTax: 0,
    disabilityTax: 0,
    totalTaxes: 0
  };

  totalFICA = 0;

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
        this.generateTaxData();
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error loading payroll records:', err);
        this.completeLoading();
      }
    });
  }

  generateTaxData(): void {
    this.taxData = this.payrollRecords.map(record => {
      const federalTax = record.federalTax || 0;
      const stateTax = record.stateTax || 0;
      const localTax = record.localTax || 0;
      const socialSecurityTax = record.socialSecurityTax || 0;
      const medicareTax = record.medicareTax || 0;
      const disabilityTax = record.disabilityTax || 0;
      const totalTaxes = federalTax + stateTax + localTax + socialSecurityTax + medicareTax + disabilityTax;

      return {
        employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'Unknown',
        employeeCode: record.employee?.employeeCode || record.employee?.id?.toString() || '-',
        department: record.employee?.department?.name || 'Unassigned',
        federalTax,
        stateTax,
        localTax,
        socialSecurityTax,
        medicareTax,
        disabilityTax,
        totalTaxes
      };
    }).sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    this.calculateGrandTotals();
  }

  calculateGrandTotals(): void {
    this.grandTotals = {
      federalTax: this.taxData.reduce((sum, row) => sum + row.federalTax, 0),
      stateTax: this.taxData.reduce((sum, row) => sum + row.stateTax, 0),
      localTax: this.taxData.reduce((sum, row) => sum + row.localTax, 0),
      socialSecurityTax: this.taxData.reduce((sum, row) => sum + row.socialSecurityTax, 0),
      medicareTax: this.taxData.reduce((sum, row) => sum + row.medicareTax, 0),
      disabilityTax: this.taxData.reduce((sum, row) => sum + row.disabilityTax, 0),
      totalTaxes: this.taxData.reduce((sum, row) => sum + row.totalTaxes, 0)
    };
    this.totalFICA = this.grandTotals.socialSecurityTax + this.grandTotals.medicareTax;
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
    const headers = ['Employee Name', 'Code', 'Department', 'Federal Tax', 'State Tax', 'Local Tax', 'Social Security', 'Medicare', 'Disability', 'Total Taxes'];
    const data = this.taxData.map(row => [
      row.employeeName,
      row.employeeCode,
      row.department,
      this.formatCurrency(row.federalTax),
      this.formatCurrency(row.stateTax),
      this.formatCurrency(row.localTax),
      this.formatCurrency(row.socialSecurityTax),
      this.formatCurrency(row.medicareTax),
      this.formatCurrency(row.disabilityTax),
      this.formatCurrency(row.totalTaxes)
    ]);

    this.exportService.exportToPDF(
      'Tax Liability Report',
      headers,
      data,
      'tax_liability_report'
    );
  }

  exportToExcel(): void {
    const data = this.taxData.map(row => ({
      'Employee Name': row.employeeName,
      'Code': row.employeeCode,
      'Department': row.department,
      'Federal Tax': row.federalTax,
      'State Tax': row.stateTax,
      'Local Tax': row.localTax,
      'Social Security': row.socialSecurityTax,
      'Medicare': row.medicareTax,
      'Disability Tax': row.disabilityTax,
      'Total Taxes': row.totalTaxes
    }));

    this.exportService.exportToExcel(data, 'tax_liability_report');
  }

  exportToCSV(): void {
    const headers = ['Employee Name', 'Code', 'Department', 'Federal Tax', 'State Tax', 'Local Tax', 'Social Security', 'Medicare', 'Disability Tax', 'Total Taxes'];
    const data = this.taxData.map(row => [
      row.employeeName,
      row.employeeCode,
      row.department,
      row.federalTax,
      row.stateTax,
      row.localTax,
      row.socialSecurityTax,
      row.medicareTax,
      row.disabilityTax,
      row.totalTaxes
    ]);

    this.exportService.exportToCSV(headers, data, 'tax_liability_report');
  }

  completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
    this.isFirstLoad = false;
  }
}
