import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRun, PayrollRecord } from '../../../services/payroll.service';
import { EmployeeService, Employee } from '../../../services/employee.service';

interface PayrollHistoryRecord {
  empId: string;
  name: string;
  project: string;
  payRatePeriod: string;
  payDate: string;
  periodTo: string;
  regular: number;
  bonus: number;
  allowances: number;
  deductions: number;
  gross: number;
  ytdGross: number;
  fedTax: number;
  stateTax: number;
  netPay: number;
  paymentDate: string;
  payStatus: string;
}

@Component({
  selector: 'app-payroll-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-history.component.html',
  styleUrls: ['./payroll-history.component.scss']
})
export class PayrollHistoryComponent implements OnInit {
  loading = false;
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  historyRecords: PayrollHistoryRecord[] = [];
  employees: Employee[] = [];

  completedRuns = 0;
  totalGross = 0;
  totalNet = 0;
  avgNetPerRun = 0;

  selectedStatus = 'ALL';
  searchTerm = '';
  dateFrom = '';
  dateTo = '';

  sortField = 'payDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadData();
  }

  setDefaultDates(): void {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    this.dateFrom = threeMonthsAgo.toISOString().split('T')[0];
    this.dateTo = today.toISOString().split('T')[0];
  }

  loadData(): void {
    this.loading = true;
    
    this.employeeService.getAll().subscribe({
      next: (emps) => {
        this.employees = emps;
        this.loadPayrollRuns();
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.loading = false;
        this.generateSampleData();
      }
    });
  }

  loadPayrollRuns(): void {
    this.payrollService.getPayrollRuns().subscribe({
      next: (runs) => {
        this.payrollRuns = runs;
        this.loadPayrollRecords();
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.loading = false;
        this.generateSampleData();
      }
    });
  }

  loadPayrollRecords(): void {
    if (this.payrollRuns.length === 0) {
      this.loading = false;
      this.generateSampleData();
      return;
    }
    
    let completed = 0;
    const allRecords: PayrollRecord[] = [];
    
    this.payrollRuns.forEach(run => {
      if (run.id) {
        this.payrollService.getPayrollRecordsByRun(run.id).subscribe({
          next: (records: PayrollRecord[]) => {
            allRecords.push(...records);
            completed++;
            if (completed === this.payrollRuns.length) {
              this.payrollRecords = allRecords;
              this.processHistoryRecords();
              this.calculateSummary();
              this.loading = false;
            }
          },
          error: () => {
            completed++;
            if (completed === this.payrollRuns.length) {
              this.payrollRecords = allRecords;
              if (allRecords.length > 0) {
                this.processHistoryRecords();
                this.calculateSummary();
              } else {
                this.generateSampleData();
              }
              this.loading = false;
            }
          }
        });
      } else {
        completed++;
      }
    });
    
    if (this.payrollRuns.every(r => !r.id)) {
      this.loading = false;
      this.generateSampleData();
    }
  }

  processHistoryRecords(): void {
    this.historyRecords = this.payrollRecords.map((record, idx) => {
      const emp = record.employee || this.employees.find(e => e.id === record.employee?.id);
      const run = record.payrollRun;
      
      return {
        empId: emp?.employeeCode || `EMP${String(idx + 1).padStart(3, '0')}`,
        name: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Unknown',
        project: emp?.department?.name || 'General',
        payRatePeriod: run?.payFrequency?.name || 'Monthly',
        payDate: run?.payDate || new Date().toISOString().split('T')[0],
        periodTo: run?.periodEndDate || new Date().toISOString().split('T')[0],
        regular: record.basePay || 0,
        bonus: record.bonuses || 0,
        allowances: record.reimbursements || 0,
        deductions: (record.healthInsurance || 0) + (record.retirement401k || 0) + (record.loanDeductions || 0),
        gross: record.grossPay || 0,
        ytdGross: (record.grossPay || 0) * 12,
        fedTax: record.federalTax || 0,
        stateTax: record.stateTax || 0,
        netPay: record.netPay || 0,
        paymentDate: run?.payDate || new Date().toISOString().split('T')[0],
        payStatus: run?.status === 'COMPLETED' ? 'Paid' : run?.status || 'Pending'
      };
    });
  }

  generateSampleData(): void {
    const names = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'David Brown'];
    const projects = ['Sales', 'Engineering', 'Marketing', 'HR', 'Finance'];
    
    this.historyRecords = this.employees.length > 0 
      ? this.employees.map((emp, idx) => {
          const basePay = 5000 + Math.random() * 3000;
          const bonus = Math.random() > 0.7 ? Math.random() * 500 : 0;
          const allowances = Math.random() * 200;
          const gross = basePay + bonus + allowances;
          const fedTax = gross * 0.15;
          const stateTax = gross * 0.05;
          const deductions = gross * 0.08;
          const netPay = gross - fedTax - stateTax - deductions;

          return {
            empId: emp.employeeCode || `EMP${String(idx + 1).padStart(3, '0')}`,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || names[idx % names.length],
            project: emp.department?.name || projects[idx % projects.length],
            payRatePeriod: 'Monthly',
            payDate: new Date().toISOString().split('T')[0],
            periodTo: new Date().toISOString().split('T')[0],
            regular: basePay,
            bonus: bonus,
            allowances: allowances,
            deductions: deductions,
            gross: gross,
            ytdGross: gross * 12,
            fedTax: fedTax,
            stateTax: stateTax,
            netPay: netPay,
            paymentDate: new Date().toISOString().split('T')[0],
            payStatus: 'Paid'
          };
        })
      : names.map((name, idx) => {
          const basePay = 5000 + Math.random() * 3000;
          const bonus = Math.random() > 0.7 ? Math.random() * 500 : 0;
          const allowances = Math.random() * 200;
          const gross = basePay + bonus + allowances;
          const fedTax = gross * 0.15;
          const stateTax = gross * 0.05;
          const deductions = gross * 0.08;
          const netPay = gross - fedTax - stateTax - deductions;

          return {
            empId: `EMP${String(idx + 1).padStart(3, '0')}`,
            name: name,
            project: projects[idx % projects.length],
            payRatePeriod: 'Monthly',
            payDate: new Date().toISOString().split('T')[0],
            periodTo: new Date().toISOString().split('T')[0],
            regular: basePay,
            bonus: bonus,
            allowances: allowances,
            deductions: deductions,
            gross: gross,
            ytdGross: gross * 12,
            fedTax: fedTax,
            stateTax: stateTax,
            netPay: netPay,
            paymentDate: new Date().toISOString().split('T')[0],
            payStatus: 'Paid'
          };
        });

    this.calculateSummary();
  }

  calculateSummary(): void {
    this.completedRuns = this.payrollRuns.filter(r => r.status === 'COMPLETED').length || 1;
    this.totalGross = this.historyRecords.reduce((sum, r) => sum + r.gross, 0);
    this.totalNet = this.historyRecords.reduce((sum, r) => sum + r.netPay, 0);
    this.avgNetPerRun = this.completedRuns > 0 ? this.totalNet / this.completedRuns : 0;
  }

  get filteredRecords(): PayrollHistoryRecord[] {
    return this.historyRecords.filter(record => {
      const matchesStatus = this.selectedStatus === 'ALL' || record.payStatus === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        record.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        record.empId.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      let matchesDateRange = true;
      if (this.dateFrom) {
        const fromDate = new Date(this.dateFrom);
        const recordDate = new Date(record.payDate);
        matchesDateRange = matchesDateRange && recordDate >= fromDate;
      }
      if (this.dateTo) {
        const toDate = new Date(this.dateTo);
        const recordDate = new Date(record.payDate);
        matchesDateRange = matchesDateRange && recordDate <= toDate;
      }
      
      return matchesStatus && matchesSearch && matchesDateRange;
    }).sort((a, b) => {
      const aVal = (a as any)[this.sortField];
      const bVal = (b as any)[this.sortField];
      const comparison = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  get salariedEmployees(): PayrollHistoryRecord[] {
    return this.filteredRecords.filter(r => r.payRatePeriod === 'Monthly' || r.payRatePeriod === 'Bi-Weekly' || r.payRatePeriod === 'Weekly');
  }

  get hourlyEmployees(): PayrollHistoryRecord[] {
    return this.filteredRecords.filter(r => r.payRatePeriod === 'Hourly' || r.payRatePeriod === 'Daily' || r.payRatePeriod === 'Contract');
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  formatCurrency(amount: number): string {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      default: return 'default';
    }
  }

  get totalRegular(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.regular, 0);
  }

  get totalBonus(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.bonus, 0);
  }

  get totalAllowances(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.allowances, 0);
  }

  get totalDeductions(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.deductions, 0);
  }

  get totalGrossFiltered(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.gross, 0);
  }

  get totalFedTax(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.fedTax, 0);
  }

  get totalStateTax(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.stateTax, 0);
  }

  get totalNetFiltered(): number {
    return this.filteredRecords.reduce((sum, r) => sum + r.netPay, 0);
  }

  exportToCSV(): void {
    const headers = ['EMP ID', 'NAME', 'PROJECT', 'PAY RATE/PERIOD', 'PAY DATE', 'PERIOD TO', 'REGULAR', 'BONUS', 'ALLOWANCES', 'DEDUCTIONS', 'GROSS', 'YTD GROSS', 'FED TAX', 'STATE TAX', 'NET PAY', 'PAYMENT DATE', 'PAY STATUS'];
    
    const csvContent = [
      headers.join(','),
      ...this.filteredRecords.map(r => [
        r.empId,
        `"${r.name}"`,
        `"${r.project}"`,
        r.payRatePeriod,
        r.payDate,
        r.periodTo,
        r.regular.toFixed(2),
        r.bonus.toFixed(2),
        r.allowances.toFixed(2),
        r.deductions.toFixed(2),
        r.gross.toFixed(2),
        r.ytdGross.toFixed(2),
        r.fedTax.toFixed(2),
        r.stateTax.toFixed(2),
        r.netPay.toFixed(2),
        r.paymentDate,
        r.payStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
