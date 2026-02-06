import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../../services/payroll.service';
import { ReportExportService } from '../../../../services/report-export.service';

@Component({
  selector: 'app-ytd-earnings-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ytd-earnings-report.component.html',
  styleUrls: ['./ytd-earnings-report.component.scss']
})
export class YtdEarningsReportComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  filteredRecords: PayrollRecord[] = [];

  selectedYear: number = new Date().getFullYear();
  searchTerm = '';

  years: number[] = [];
  loading = false;

  totals = {
    basePay: 0,
    overtimePay: 0,
    bonuses: 0,
    grossPay: 0,
    totalTaxes: 0,
    totalDeductions: 0,
    netPay: 0
  };

  constructor(
    private payrollService: PayrollService,
    private exportService: ReportExportService
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  ngOnInit(): void {
    this.loadPayrollRuns();
  }

  loadPayrollRuns(): void {
    this.loading = true;

    this.payrollService.getPayrollRuns().subscribe({
      next: (data) => {
        this.payrollRuns = data.filter(run => run.status === 'PROCESSED' || run.status === 'APPROVED');
        this.loadYtdData();
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.loading = false;
      }
    });
  }

  loadYtdData(): void {
    const yearRuns = this.payrollRuns.filter(run => {
      const runYear = new Date(run.periodStartDate).getFullYear();
      return runYear === this.selectedYear;
    });

    if (yearRuns.length === 0) {
      this.payrollRecords = [];
      this.filteredRecords = [];
      this.calculateTotals();
      this.loading = false;
      return;
    }

    this.loading = true;
    const allRecords: PayrollRecord[] = [];
    let completedRequests = 0;

    yearRuns.forEach(run => {
      this.payrollService.getPayrollRecordsByRun(run.id!).subscribe({
        next: (data) => {
          allRecords.push(...data);
          completedRequests++;

          if (completedRequests === yearRuns.length) {
            this.payrollRecords = this.aggregateYtdRecords(allRecords);
            this.applyFilters();
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading payroll records:', err);
          completedRequests++;
          if (completedRequests === yearRuns.length) {
            this.payrollRecords = this.aggregateYtdRecords(allRecords);
            this.applyFilters();
            this.loading = false;
          }
        }
      });
    });
  }

  aggregateYtdRecords(records: PayrollRecord[]): PayrollRecord[] {
    const grouped = new Map<number, PayrollRecord>();

    records.forEach(record => {
      const empId = record.employee?.id;
      if (!empId) return;

      if (!grouped.has(empId)) {
        grouped.set(empId, {
          ...record,
          grossPay: 0,
          totalDeductions: 0,
          totalTaxes: 0,
          netPay: 0,
          totalEmployerContributions: 0,
          basePay: 0,
          overtimePay: 0,
          bonuses: 0
        });
      }

      const agg = grouped.get(empId)!;
      agg.grossPay = (agg.grossPay || 0) + (record.grossPay || 0);
      agg.totalDeductions = (agg.totalDeductions || 0) + (record.totalDeductions || 0);
      agg.totalTaxes = (agg.totalTaxes || 0) + (record.totalTaxes || 0);
      agg.netPay = (agg.netPay || 0) + (record.netPay || 0);
      agg.totalEmployerContributions = (agg.totalEmployerContributions || 0) + (record.totalEmployerContributions || 0);
      agg.basePay = (agg.basePay || 0) + (record.basePay || 0);
      agg.overtimePay = (agg.overtimePay || 0) + (record.overtimePay || 0);
      agg.bonuses = (agg.bonuses || 0) + (record.bonuses || 0);
    });

    return Array.from(grouped.values());
  }

  applyFilters(): void {
    this.filteredRecords = this.payrollRecords.filter(record => {
      if (!this.searchTerm) return true;
      const searchLower = this.searchTerm.toLowerCase();
      const employeeName = `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.toLowerCase();
      const employeeCode = (record.employee?.employeeCode || '').toLowerCase();
      return employeeName.includes(searchLower) || employeeCode.includes(searchLower);
    });

    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totals = {
      basePay: this.filteredRecords.reduce((sum, r) => sum + (r.basePay || 0), 0),
      overtimePay: this.filteredRecords.reduce((sum, r) => sum + (r.overtimePay || 0), 0),
      bonuses: this.filteredRecords.reduce((sum, r) => sum + (r.bonuses || 0), 0),
      grossPay: this.filteredRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0),
      totalTaxes: this.filteredRecords.reduce((sum, r) => sum + (r.totalTaxes || 0), 0),
      totalDeductions: this.filteredRecords.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
      netPay: this.filteredRecords.reduce((sum, r) => sum + (r.netPay || 0), 0)
    };
  }

  onYearChange(): void {
    this.loadYtdData();
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

  getReportTitle(): string {
    return `YTD Earnings Report - ${this.selectedYear}`;
  }

  exportToPDF(): void {
    const headers = ['Employee', 'Code', 'Department', 'YTD Base Pay', 'YTD Overtime', 'YTD Bonuses', 'YTD Gross Pay', 'YTD Taxes', 'YTD Deductions', 'YTD Net Pay'];
    const data = this.filteredRecords.map(record => [
      this.getEmployeeName(record),
      this.getEmployeeCode(record),
      this.getDepartment(record),
      this.formatCurrency(record.basePay || 0),
      this.formatCurrency(record.overtimePay || 0),
      this.formatCurrency(record.bonuses || 0),
      this.formatCurrency(record.grossPay || 0),
      this.formatCurrency(record.totalTaxes || 0),
      this.formatCurrency(record.totalDeductions || 0),
      this.formatCurrency(record.netPay || 0)
    ]);

    this.exportService.exportToPDF(this.getReportTitle(), headers, data, `ytd_earnings_${this.selectedYear}`);
  }

  exportToExcel(): void {
    const data = this.filteredRecords.map(record => ({
      'Employee Name': this.getEmployeeName(record),
      'Employee Code': this.getEmployeeCode(record),
      'Department': this.getDepartment(record),
      'YTD Base Pay': record.basePay || 0,
      'YTD Overtime': record.overtimePay || 0,
      'YTD Bonuses': record.bonuses || 0,
      'YTD Gross Pay': record.grossPay || 0,
      'YTD Taxes': record.totalTaxes || 0,
      'YTD Deductions': record.totalDeductions || 0,
      'YTD Net Pay': record.netPay || 0
    }));

    this.exportService.exportToExcel(data, `ytd_earnings_${this.selectedYear}`);
  }

  exportToCSV(): void {
    const headers = ['Employee Name', 'Employee Code', 'Department', 'YTD Base Pay', 'YTD Overtime', 'YTD Bonuses', 'YTD Gross Pay', 'YTD Taxes', 'YTD Deductions', 'YTD Net Pay'];
    const data = this.filteredRecords.map(record => [
      this.getEmployeeName(record),
      this.getEmployeeCode(record),
      this.getDepartment(record),
      record.basePay || 0,
      record.overtimePay || 0,
      record.bonuses || 0,
      record.grossPay || 0,
      record.totalTaxes || 0,
      record.totalDeductions || 0,
      record.netPay || 0
    ]);

    this.exportService.exportToCSV(headers, data, `ytd_earnings_${this.selectedYear}`);
  }
}
