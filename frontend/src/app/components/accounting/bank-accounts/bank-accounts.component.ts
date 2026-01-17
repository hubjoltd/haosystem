import { Component, OnInit } from '@angular/core';
import { AccountingService, BankAccount, ChartOfAccount } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-bank-accounts',
  standalone: false,
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.scss']
})
export class BankAccountsComponent implements OnInit {
  bankAccounts: BankAccount[] = [];
  glAccounts: ChartOfAccount[] = [];
  loading = true;
  
  displayDialog = false;
  isEdit = false;
  
  accountTypes = [
    { label: 'Checking', value: 'Checking' },
    { label: 'Savings', value: 'Savings' },
    { label: 'Credit Card', value: 'Credit Card' },
    { label: 'Cash', value: 'Cash' },
    { label: 'Other', value: 'Other' }
  ];

  currencies = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'AED - UAE Dirham', value: 'AED' }
  ];

  newAccount: BankAccount = this.getEmptyAccount();

  showDeleteConfirm = false;
  accountToDelete: BankAccount | null = null;

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.accountingService.getAllBankAccounts().subscribe({
      next: (accounts) => {
        this.bankAccounts = accounts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bank accounts:', err);
        this.loading = false;
      }
    });

    this.accountingService.getAccountsByType('Asset').subscribe({
      next: (accounts) => {
        this.glAccounts = accounts;
      }
    });
  }

  getEmptyAccount(): BankAccount {
    return {
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankBranch: '',
      accountType: 'Checking',
      currencyCode: 'USD',
      openingBalance: 0,
      currentBalance: 0,
      isPrimary: false,
      isActive: true
    };
  }

  openNewDialog(): void {
    this.newAccount = this.getEmptyAccount();
    this.isEdit = false;
    this.displayDialog = true;
  }

  editAccount(account: BankAccount): void {
    this.newAccount = { ...account };
    this.isEdit = true;
    this.displayDialog = true;
  }

  saveAccount(): void {
    if (this.isEdit && this.newAccount.id) {
      this.accountingService.updateBankAccount(this.newAccount.id, this.newAccount).subscribe({
        next: () => {
          this.notificationService.success('Bank account updated successfully');
          this.displayDialog = false;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to update bank account');
        }
      });
    } else {
      this.accountingService.createBankAccount(this.newAccount).subscribe({
        next: () => {
          this.notificationService.success('Bank account created successfully');
          this.displayDialog = false;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to create bank account');
        }
      });
    }
  }

  confirmDelete(account: BankAccount): void {
    this.accountToDelete = account;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.accountToDelete = null;
  }

  deleteAccount(): void {
    if (this.accountToDelete && this.accountToDelete.id) {
      this.accountingService.deleteBankAccount(this.accountToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Bank account deleted successfully');
          this.showDeleteConfirm = false;
          this.accountToDelete = null;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to delete bank account');
          this.showDeleteConfirm = false;
        }
      });
    }
  }

  viewTransactions(account: BankAccount): void {
    // Navigate to transactions view
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  }

  getTotalBalance(): number {
    return this.bankAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  }
}
