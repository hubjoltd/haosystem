import { Component, OnInit } from '@angular/core';
import { AccountingService, BankAccount } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  bankAccounts: BankAccount[] = [];
  loading = false;
  searchText = '';
  selectedAccountId: number | null = null;

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBankAccounts();
  }

  loadBankAccounts(): void {
    this.loading = true;
    this.accountingService.getAllBankAccounts().subscribe({
      next: (accounts) => {
        this.bankAccounts = accounts;
        if (accounts.length > 0) {
          this.selectedAccountId = accounts[0].id!;
          this.loadTransactions();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.notificationService.error('Failed to load bank accounts');
        this.loading = false;
      }
    });
  }

  loadTransactions(): void {
    if (!this.selectedAccountId) {
      this.transactions = [];
      return;
    }
    this.loading = true;
    this.accountingService.getBankTransactions(this.selectedAccountId).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load transactions');
        this.loading = false;
      }
    });
  }

  onAccountChange(): void {
    this.loadTransactions();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
