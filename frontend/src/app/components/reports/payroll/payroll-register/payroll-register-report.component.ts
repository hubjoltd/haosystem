import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../../services/payroll.service';
import { ReportExportService } from '../../../../services/report-export.service';

@Component({
  selector: 'app-payroll-register-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-register-report.component.html',
  styleUrls: ['./payroll-register-report.component.scss']
})
export class PayrollRegisterReportComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  filteredRecords: PayrollRecord[] = [];
  
  selectedRunId: number | null = null;
  reportType: 'monthly' | 'annual' = 'monthly';
  selectedYear: number = new Date().getFullYear();
  searchTerm = '';
  
  years: number[] = [];
  loading = false;
  
  // Modal properties
  showDetailsModal = false;
  selectedRecord: PayrollRecord | null = null;
  
  totals = {
    grossPay: 0,
    totalDeductions: 0,
    totalTaxes: 0,
    netPay: 0,
    employerContributions: 0
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
    this.payrollService.getPayrollRuns().subscribe({
      next: (data) => {
        this.payrollRuns = data.filter(run => run.status === 'PROCESSED' || run.status === 'APPROVED');
        if (this.reportType === 'monthly' && this.payrollRuns.length > 0) {
          this.selectedRunId = this.payrollRuns[0].id!;
          this.loadPayrollRecords();
        } else if (this.reportType === 'annual') {
          this.loadAnnualData();
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
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payroll records:', err);
        this.loading = false;
      }
    });
  }

  loadAnnualData(): void {
    const yearRuns = this.payrollRuns.filter(run => {
      const runYear = new Date(run.periodStartDate).getFullYear();
      return runYear === this.selectedYear;
    });

    if (yearRuns.length === 0) {
      this.payrollRecords = [];
      this.filteredRecords = [];
      this.calculateTotals();
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
            this.payrollRecords = this.aggregateAnnualRecords(allRecords);
            this.applyFilters();
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading payroll records:', err);
          completedRequests++;
          if (completedRequests === yearRuns.length) {
            this.payrollRecords = this.aggregateAnnualRecords(allRecords);
            this.applyFilters();
            this.loading = false;
          }
        }
      });
    });
  }

  aggregateAnnualRecords(records: PayrollRecord[]): PayrollRecord[] {
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
      grossPay: this.filteredRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0),
      totalDeductions: this.filteredRecords.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
      totalTaxes: this.filteredRecords.reduce((sum, r) => sum + (r.totalTaxes || 0), 0),
      netPay: this.filteredRecords.reduce((sum, r) => sum + (r.netPay || 0), 0),
      employerContributions: this.filteredRecords.reduce((sum, r) => sum + (r.totalEmployerContributions || 0), 0)
    };
  }

  onReportTypeChange(): void {
    if (this.reportType === 'monthly') {
      if (this.payrollRuns.length > 0) {
        this.selectedRunId = this.payrollRuns[0].id!;
        this.loadPayrollRecords();
      }
    } else {
      this.loadAnnualData();
    }
  }

  onRunChange(): void {
    this.loadPayrollRecords();
  }

  onYearChange(): void {
    this.loadAnnualData();
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

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getReportTitle(): string {
    if (this.reportType === 'annual') {
      return `Annual Payroll Register - ${this.selectedYear}`;
    }
    const run = this.payrollRuns.find(r => r.id === this.selectedRunId);
    if (run) {
      return `Monthly Payroll Register - ${run.payrollRunNumber}`;
    }
    return 'Payroll Register';
  }

  exportToPDF(): void {
    const headers = ['Employee', 'Code', 'Department', 'Gross Pay', 'Deductions', 'Taxes', 'Net Pay', 'Employer Cost'];
    const data = this.filteredRecords.map(record => [
      this.getEmployeeName(record),
      this.getEmployeeCode(record),
      this.getDepartment(record),
      this.formatCurrency(record.grossPay || 0),
      this.formatCurrency(record.totalDeductions || 0),
      this.formatCurrency(record.totalTaxes || 0),
      this.formatCurrency(record.netPay || 0),
      this.formatCurrency(record.totalEmployerContributions || 0)
    ]);
    
    this.exportService.exportToPDF(this.getReportTitle(), headers, data, `payroll_register_${this.reportType}`);
  }

  exportToExcel(): void {
    const data = this.filteredRecords.map(record => ({
      'Employee Name': this.getEmployeeName(record),
      'Employee Code': this.getEmployeeCode(record),
      'Department': this.getDepartment(record),
      'Base Pay': record.basePay || 0,
      'Overtime Pay': record.overtimePay || 0,
      'Bonuses': record.bonuses || 0,
      'Gross Pay': record.grossPay || 0,
      'Pre-Tax Deductions': record.preTaxDeductions || 0,
      'Federal Tax': record.federalTax || 0,
      'State Tax': record.stateTax || 0,
      'Social Security': record.socialSecurityTax || 0,
      'Medicare': record.medicareTax || 0,
      'Total Taxes': record.totalTaxes || 0,
      'Post-Tax Deductions': record.postTaxDeductions || 0,
      'Total Deductions': record.totalDeductions || 0,
      'Net Pay': record.netPay || 0,
      'Employer SS': record.employerSocialSecurity || 0,
      'Employer Medicare': record.employerMedicare || 0,
      'Employer Health': record.employerHealthContribution || 0,
      'Employer 401k': record.employer401kMatch || 0,
      'Total Employer Contributions': record.totalEmployerContributions || 0
    }));
    
    this.exportService.exportToExcel(data, `payroll_register_${this.reportType}`);
  }

  exportToCSV(): void {
    const headers = ['Employee Name', 'Employee Code', 'Department', 'Gross Pay', 'Total Deductions', 'Total Taxes', 'Net Pay', 'Employer Contributions'];
    const data = this.filteredRecords.map(record => [
      this.getEmployeeName(record),
      this.getEmployeeCode(record),
      this.getDepartment(record),
      record.grossPay || 0,
      record.totalDeductions || 0,
      record.totalTaxes || 0,
      record.netPay || 0,
      record.totalEmployerContributions || 0
    ]);
    
    this.exportService.exportToCSV(headers, data, `payroll_register_${this.reportType}`);
  }

  openDetailsModal(record: PayrollRecord): void {
    this.selectedRecord = record;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRecord = null;
  }
}
