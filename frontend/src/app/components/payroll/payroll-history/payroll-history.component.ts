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
    const salariedData: PayrollHistoryRecord[] = [
      {
        empId: 'EMP001', name: 'Ganesh M', project: 'Apollo Manufacturing',
        payRatePeriod: 'Monthly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 8500.00, bonus: 500.00, allowances: 250.00, deductions: 450.00,
        gross: 9250.00, ytdGross: 111000.00, fedTax: 1387.50, stateTax: 462.50,
        netPay: 6950.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      },
      {
        empId: 'EMP002', name: 'Priya Sharma', project: 'Tech Solutions',
        payRatePeriod: 'Monthly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 7200.00, bonus: 300.00, allowances: 200.00, deductions: 380.00,
        gross: 7700.00, ytdGross: 92400.00, fedTax: 1155.00, stateTax: 385.00,
        netPay: 5780.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      },
      {
        empId: 'EMP003', name: 'Rahul Kumar', project: 'Finance Dept',
        payRatePeriod: 'Bi-Weekly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 4200.00, bonus: 0.00, allowances: 150.00, deductions: 220.00,
        gross: 4350.00, ytdGross: 113100.00, fedTax: 652.50, stateTax: 217.50,
        netPay: 3260.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      },
      {
        empId: 'EMP004', name: 'Anita Patel', project: 'HR Operations',
        payRatePeriod: 'Monthly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 6800.00, bonus: 400.00, allowances: 180.00, deductions: 360.00,
        gross: 7380.00, ytdGross: 88560.00, fedTax: 1107.00, stateTax: 369.00,
        netPay: 5544.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      },
      {
        empId: 'EMP005', name: 'Vijay Singh', project: 'Sales Division',
        payRatePeriod: 'Weekly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 1850.00, bonus: 250.00, allowances: 100.00, deductions: 110.00,
        gross: 2200.00, ytdGross: 114400.00, fedTax: 330.00, stateTax: 110.00,
        netPay: 1650.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      }
    ];

    const hourlyData: PayrollHistoryRecord[] = [
      {
        empId: 'EMP006', name: 'Sanjay Verma', project: 'Warehouse Ops',
        payRatePeriod: 'Hourly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 3200.00, bonus: 0.00, allowances: 80.00, deductions: 165.00,
        gross: 3280.00, ytdGross: 39360.00, fedTax: 492.00, stateTax: 164.00,
        netPay: 2459.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      },
      {
        empId: 'EMP007', name: 'Meera Reddy', project: 'Customer Support',
        payRatePeriod: 'Hourly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 2880.00, bonus: 100.00, allowances: 50.00, deductions: 150.00,
        gross: 3030.00, ytdGross: 36360.00, fedTax: 454.50, stateTax: 151.50,
        netPay: 2274.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      },
      {
        empId: 'EMP008', name: 'Arjun Nair', project: 'IT Support',
        payRatePeriod: 'Daily', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 4400.00, bonus: 0.00, allowances: 120.00, deductions: 230.00,
        gross: 4520.00, ytdGross: 54240.00, fedTax: 678.00, stateTax: 226.00,
        netPay: 3386.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      },
      {
        empId: 'EMP009', name: 'Kavitha Das', project: 'Quality Control',
        payRatePeriod: 'Hourly', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 3520.00, bonus: 150.00, allowances: 90.00, deductions: 190.00,
        gross: 3760.00, ytdGross: 45120.00, fedTax: 564.00, stateTax: 188.00,
        netPay: 2818.00, paymentDate: '2024-12-15', payStatus: 'Pending'
      },
      {
        empId: 'EMP010', name: 'Rajesh Iyer', project: 'Logistics',
        payRatePeriod: 'Contract', payDate: '2024-12-15', periodTo: '2024-12-31',
        regular: 5500.00, bonus: 0.00, allowances: 200.00, deductions: 290.00,
        gross: 5700.00, ytdGross: 68400.00, fedTax: 855.00, stateTax: 285.00,
        netPay: 4270.00, paymentDate: '2024-12-15', payStatus: 'Paid'
      }
    ];

    this.historyRecords = [...salariedData, ...hourlyData];
    this.completedRuns = 8;
    this.calculateSummary();
  }

  calculateSummary(): void {
    const runsCount = this.payrollRuns.filter(r => r.status === 'COMPLETED').length;
    if (runsCount > 0) {
      this.completedRuns = runsCount;
    } else if (this.completedRuns === 0) {
      this.completedRuns = 8;
    }
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
