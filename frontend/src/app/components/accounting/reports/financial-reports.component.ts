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
    { id: 'trial-balance', name: 'Trial Balance', icon: 'fas fa-balance-scale', description: 'View debit and credit balances for all accounts' },
    { id: 'income-statement', name: 'Income Statement', icon: 'fas fa-chart-line', description: 'Revenue, expenses, and net income/loss' },
    { id: 'balance-sheet', name: 'Balance Sheet', icon: 'fas fa-file-invoice-dollar', description: 'Assets, liabilities, and equity snapshot' },
    { id: 'cash-flow', name: 'Cash Flow Statement', icon: 'fas fa-money-bill-wave', description: 'Cash inflows and outflows by activity' },
    { id: 'general-ledger', name: 'General Ledger', icon: 'fas fa-book', description: 'Complete transaction history by account' },
    { id: 'aged-payables', name: 'Aged Payables', icon: 'fas fa-clock', description: 'Outstanding payables by aging period' }
  ];

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
