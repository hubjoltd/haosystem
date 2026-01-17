import { Component, OnInit } from '@angular/core';
import { AccountingService, AccountingDashboard, BankAccount } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-accounting-dashboard',
  standalone: false,
  templateUrl: './accounting-dashboard.component.html',
  styleUrls: ['./accounting-dashboard.component.scss']
})
export class AccountingDashboardComponent implements OnInit {
  dashboard: AccountingDashboard | null = null;
  bankAccounts: BankAccount[] = [];
  loading = true;

  private maxValue = 0;

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.accountingService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.calculateMaxValue();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading = false;
      }
    });

    this.accountingService.getActiveBankAccounts().subscribe({
      next: (accounts) => {
        this.bankAccounts = accounts;
      },
      error: (err) => {
        console.error('Error loading bank accounts:', err);
      }
    });
  }

  calculateMaxValue(): void {
    if (!this.dashboard) return;
    const balances = this.dashboard.accountBalances;
    this.maxValue = Math.max(
      balances.income || 0,
      balances.expenses || 0,
      Math.abs(this.dashboard.profitLoss || 0)
    );
  }

  getBarWidth(type: string): number {
    if (!this.dashboard || this.maxValue === 0) return 0;
    const balances = this.dashboard.accountBalances;
    
    switch (type) {
      case 'income':
        return ((balances.income || 0) / this.maxValue) * 100;
      case 'expenses':
        return ((balances.expenses || 0) / this.maxValue) * 100;
      case 'profitLoss':
        return (Math.abs(this.dashboard.profitLoss || 0) / this.maxValue) * 100;
      default:
        return 0;
    }
  }

  getDonutSegment(type: string): string {
    if (!this.dashboard) return '0 251.2';
    const income = this.dashboard.accountBalances.income || 0;
    const expenses = this.dashboard.accountBalances.expenses || 0;
    const total = income + expenses;
    
    if (total === 0) return '0 251.2';
    
    const circumference = 2 * Math.PI * 40;
    let percentage = 0;
    
    if (type === 'income') {
      percentage = income / total;
    } else {
      percentage = expenses / total;
    }
    
    const dashLength = circumference * percentage;
    return `${dashLength} ${circumference - dashLength}`;
  }

  getDonutOffset(): string {
    if (!this.dashboard) return '0';
    const income = this.dashboard.accountBalances.income || 0;
    const expenses = this.dashboard.accountBalances.expenses || 0;
    const total = income + expenses;
    
    if (total === 0) return '0';
    
    const circumference = 2 * Math.PI * 40;
    const incomePercentage = income / total;
    const offset = -circumference * incomePercentage;
    return `${offset}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  }

  initializeAccounts(): void {
    this.loading = true;
    this.accountingService.initializeChartOfAccounts().subscribe({
      next: () => {
        this.notificationService.success('Chart of Accounts initialized successfully');
        this.loadDashboard();
      },
      error: (err) => {
        this.notificationService.error('Failed to initialize Chart of Accounts');
        this.loading = false;
      }
    });
  }
}
