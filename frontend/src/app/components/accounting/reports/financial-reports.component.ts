import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountingService } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-financial-reports',
  standalone: false,
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.scss']
})
export class FinancialReportsComponent implements OnInit {
  loading = false;
  selectedReport: string | null = null;
  reportData: any = null;
  startDate = '';
  endDate = '';

  reports = [
    { id: 'trial-balance', name: 'Trial Balance', icon: 'fas fa-balance-scale', description: 'View debit and credit balances for all accounts', category: 'Core' },
    { id: 'income-statement', name: 'Income Statement', icon: 'fas fa-chart-line', description: 'Revenue, expenses, and net income/loss', category: 'Core' },
    { id: 'balance-sheet', name: 'Balance Sheet', icon: 'fas fa-file-invoice-dollar', description: 'Assets, liabilities, and equity snapshot', category: 'Core' },
    { id: 'cash-flow', name: 'Cash Flow Statement', icon: 'fas fa-money-bill-wave', description: 'Cash inflows and outflows by activity', category: 'Core' },
    { id: 'general-ledger', name: 'General Ledger', icon: 'fas fa-book', description: 'Complete transaction history by account', category: 'Core' },
    { id: 'deposit-detail', name: 'Deposit Detail', icon: 'fas fa-piggy-bank', description: 'Your deposits with date, customer/supplier, and amount', category: 'Sales & Customers' },
    { id: 'income-by-customer', name: 'Income by Customer Summary', icon: 'fas fa-user-tag', description: 'Net income for each customer', category: 'Sales & Customers' },
    { id: 'cheque-detail', name: 'Cheque Detail', icon: 'fas fa-money-check', description: 'Checks written with date, payee, and amount', category: 'Expenses & Suppliers' },
    { id: 'budget-overview', name: 'Budget Overview', icon: 'fas fa-clipboard-list', description: 'Summary of budgeted account balances', category: 'Budgets' },
    { id: 'budget-vs-actual', name: 'P&L Budget vs Actual', icon: 'fas fa-chart-bar', description: 'Compare budgeted vs actual amounts', category: 'Budgets' },
    { id: 'budget-performance', name: 'Budget Performance', icon: 'fas fa-tachometer-alt', description: 'Monthly, YTD, and annual budget comparison', category: 'Budgets' },
    { id: 'ar-aging-summary', name: 'A/R Aging Summary', icon: 'fas fa-file-invoice', description: 'Unpaid balances by customer, grouped by days past due', category: 'A/R Reports' },
    { id: 'ar-aging-detail', name: 'A/R Aging Detail', icon: 'fas fa-list-alt', description: 'Unpaid invoices grouped by days past due', category: 'A/R Reports' },
    { id: 'ap-aging-summary', name: 'A/P Aging Summary', icon: 'fas fa-file-invoice-dollar', description: 'Unpaid bills grouped by days past due', category: 'A/P Reports' },
    { id: 'ap-aging-detail', name: 'A/P Aging Detail', icon: 'fas fa-receipt', description: 'Unpaid bills detail grouped by days past due', category: 'A/P Reports' }
  ];
  
  reportCategories = ['Core', 'Sales & Customers', 'Expenses & Suppliers', 'Budgets', 'A/R Reports', 'A/P Reports'];

  getReportsByCategory(category: string): any[] {
    return this.reports.filter(r => r.category === category);
  }

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.cdr.detectChanges();
  }

  selectReport(reportId: string): void {
    this.selectedReport = reportId;
    this.reportData = null;
    this.cdr.detectChanges();
  }

  generateReport(): void {
    if (!this.selectedReport) return;

    this.loading = true;
    
    switch (this.selectedReport) {
      case 'trial-balance':
        this.accountingService.getTrialBalance(this.endDate).subscribe({
          next: (data) => {
            this.reportData = data;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.notificationService.error('Failed to generate report');
            this.cdr.detectChanges();
          }
        });
        break;
      case 'income-statement':
        this.accountingService.getIncomeStatement(this.startDate, this.endDate).subscribe({
          next: (data) => {
            this.reportData = data;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.notificationService.error('Failed to generate report');
            this.cdr.detectChanges();
          }
        });
        break;
      case 'balance-sheet':
        this.accountingService.getBalanceSheet(this.endDate).subscribe({
          next: (data) => {
            this.reportData = data;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.notificationService.error('Failed to generate report');
            this.cdr.detectChanges();
          }
        });
        break;
      case 'deposit-detail':
        this.accountingService.getDepositDetail(this.startDate, this.endDate).subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      case 'income-by-customer':
        this.accountingService.getIncomeByCustomer(this.startDate, this.endDate).subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      case 'cheque-detail':
        this.accountingService.getChequeDetail(this.startDate, this.endDate).subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      case 'budget-overview':
        this.accountingService.getBudgetOverview().subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      case 'ar-aging-summary':
        this.accountingService.getARAgingSummary().subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      case 'ar-aging-detail':
        this.accountingService.getARAgingDetail().subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      case 'ap-aging-summary':
        this.accountingService.getAPAgingSummary().subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      case 'ap-aging-detail':
        this.accountingService.getAPAgingDetail().subscribe({
          next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.notificationService.error('Failed to generate report'); this.cdr.detectChanges(); }
        });
        break;
      default:
        this.loading = false;
        this.notificationService.info('Report coming soon');
        this.cdr.detectChanges();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  getSelectedReportName(): string {
    const report = this.reports.find(r => r.id === this.selectedReport);
    return report ? report.name : '';
  }

  backToList(): void {
    this.selectedReport = null;
    this.reportData = null;
    this.cdr.detectChanges();
  }
}
