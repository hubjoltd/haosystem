import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountingService, ChartOfAccount, AccountCategory } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-chart-of-accounts',
  standalone: false,
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss']
})
export class ChartOfAccountsComponent implements OnInit {
  accounts: ChartOfAccount[] = [];
  filteredAccounts: ChartOfAccount[] = [];
  categories: AccountCategory[] = [];
  loading = true;
  
  displayDialog = false;
  selectedAccount: ChartOfAccount | null = null;
  isEdit = false;
  
  accountTypes = [
    { label: 'Asset', value: 'Asset' },
    { label: 'Liability', value: 'Liability' },
    { label: 'Equity', value: 'Equity' },
    { label: 'Income', value: 'Income' },
    { label: 'Expense', value: 'Expense' }
  ];

  balanceTypes = [
    { label: 'Debit', value: 'Debit' },
    { label: 'Credit', value: 'Credit' }
  ];

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  selectedType: string | null = null;
  searchText = '';

  newAccount: ChartOfAccount = this.getEmptyAccount();

  showDeleteConfirm = false;
  accountToDelete: ChartOfAccount | null = null;

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.accountingService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.accountingService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.filteredAccounts = this.accounts.filter(account => {
      const matchesType = !this.selectedType || account.accountType === this.selectedType;
      const matchesSearch = !this.searchText || 
        account.accountCode.toLowerCase().includes(this.searchText.toLowerCase()) ||
        account.accountName.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesType && matchesSearch;
    });
  }

  getEmptyAccount(): ChartOfAccount {
    return {
      accountCode: '',
      accountName: '',
      accountType: 'Asset',
      balanceType: 'Debit',
      status: 'Active',
      openingBalance: 0,
      currentBalance: 0,
      isHeader: false,
      isSubAccount: false,
      taxApplicable: false
    };
  }

  openNewDialog(): void {
    this.newAccount = this.getEmptyAccount();
    this.isEdit = false;
    this.displayDialog = true;
  }

  editAccount(account: ChartOfAccount): void {
    this.newAccount = { ...account };
    this.isEdit = true;
    this.displayDialog = true;
  }

  saveAccount(): void {
    if (this.isEdit && this.newAccount.id) {
      this.accountingService.updateAccount(this.newAccount.id, this.newAccount).subscribe({
        next: () => {
          this.notificationService.success('Account updated successfully');
          this.displayDialog = false;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to update account');
        }
      });
    } else {
      this.accountingService.createAccount(this.newAccount).subscribe({
        next: () => {
          this.notificationService.success('Account created successfully');
          this.displayDialog = false;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to create account');
        }
      });
    }
  }

  confirmDelete(account: ChartOfAccount): void {
    this.accountToDelete = account;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.accountToDelete = null;
  }

  deleteAccount(): void {
    if (this.accountToDelete && this.accountToDelete.id) {
      this.accountingService.deleteAccount(this.accountToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Account deleted successfully');
          this.showDeleteConfirm = false;
          this.accountToDelete = null;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to delete account');
          this.showDeleteConfirm = false;
        }
      });
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Asset': return 'fas fa-building';
      case 'Liability': return 'fas fa-credit-card';
      case 'Equity': return 'fas fa-balance-scale';
      case 'Income': return 'fas fa-arrow-up';
      case 'Expense': return 'fas fa-arrow-down';
      default: return 'fas fa-folder';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Asset': return '#3b82f6';
      case 'Liability': return '#f97316';
      case 'Equity': return '#8b5cf6';
      case 'Income': return '#22c55e';
      case 'Expense': return '#ef4444';
      default: return '#64748b';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  }
}
