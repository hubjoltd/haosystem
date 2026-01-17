import { Component, OnInit } from '@angular/core';
import { AccountingService, JournalEntry, JournalLine, ChartOfAccount } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-journal-entries',
  standalone: false,
  templateUrl: './journal-entries.component.html',
  styleUrls: ['./journal-entries.component.scss']
})
export class JournalEntriesComponent implements OnInit {
  entries: JournalEntry[] = [];
  accounts: ChartOfAccount[] = [];
  loading = true;
  
  displayDialog = false;
  isEdit = false;
  
  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Posted', value: 'Posted' }
  ];

  selectedStatus = '';
  searchText = '';

  newEntry: JournalEntry = this.getEmptyEntry();

  showDeleteConfirm = false;
  showPostConfirm = false;
  showReverseConfirm = false;
  entryToAction: JournalEntry | null = null;

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.accountingService.getAllJournalEntries().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading journal entries:', err);
        this.loading = false;
      }
    });

    this.accountingService.getPostableAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      }
    });
  }

  getEmptyEntry(): JournalEntry {
    return {
      entryDate: new Date().toISOString().split('T')[0],
      description: '',
      lines: [
        { account: {} as ChartOfAccount, debitAmount: 0, creditAmount: 0 },
        { account: {} as ChartOfAccount, debitAmount: 0, creditAmount: 0 }
      ]
    };
  }

  openNewDialog(): void {
    this.newEntry = this.getEmptyEntry();
    this.isEdit = false;
    this.displayDialog = true;
  }

  viewEntry(entry: JournalEntry): void {
    if (entry.id) {
      this.accountingService.getJournalEntryById(entry.id).subscribe({
        next: (fullEntry) => {
          this.newEntry = fullEntry;
          this.isEdit = true;
          this.displayDialog = true;
        }
      });
    }
  }

  addLine(): void {
    this.newEntry.lines.push({ account: {} as ChartOfAccount, debitAmount: 0, creditAmount: 0 });
  }

  removeLine(index: number): void {
    if (this.newEntry.lines.length > 2) {
      this.newEntry.lines.splice(index, 1);
    }
  }

  calculateTotals(): { debit: number; credit: number; balanced: boolean } {
    const debit = this.newEntry.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const credit = this.newEntry.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    return { debit, credit, balanced: Math.abs(debit - credit) < 0.01 };
  }

  saveEntry(): void {
    const totals = this.calculateTotals();
    if (!totals.balanced) {
      this.notificationService.error('Debits must equal credits');
      return;
    }

    this.accountingService.createJournalEntry(this.newEntry).subscribe({
      next: () => {
        this.notificationService.success('Journal entry created successfully');
        this.displayDialog = false;
        this.loadData();
      },
      error: (err) => {
        this.notificationService.error('Failed to create journal entry');
      }
    });
  }

  confirmPost(entry: JournalEntry): void {
    this.entryToAction = entry;
    this.showPostConfirm = true;
  }

  postEntry(): void {
    if (this.entryToAction && this.entryToAction.id) {
      this.accountingService.postJournalEntry(this.entryToAction.id).subscribe({
        next: () => {
          this.notificationService.success('Journal entry posted successfully');
          this.showPostConfirm = false;
          this.entryToAction = null;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to post journal entry');
          this.showPostConfirm = false;
        }
      });
    }
  }

  confirmReverse(entry: JournalEntry): void {
    this.entryToAction = entry;
    this.showReverseConfirm = true;
  }

  reverseEntry(): void {
    if (this.entryToAction && this.entryToAction.id) {
      this.accountingService.reverseJournalEntry(this.entryToAction.id).subscribe({
        next: () => {
          this.notificationService.success('Journal entry reversed successfully');
          this.showReverseConfirm = false;
          this.entryToAction = null;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error('Failed to reverse journal entry');
          this.showReverseConfirm = false;
        }
      });
    }
  }

  confirmDeleteEntry(entry: JournalEntry): void {
    this.entryToAction = entry;
    this.showDeleteConfirm = true;
  }

  cancelAction(): void {
    this.showDeleteConfirm = false;
    this.showPostConfirm = false;
    this.showReverseConfirm = false;
    this.entryToAction = null;
  }

  deleteEntry(): void {
    if (this.entryToAction && this.entryToAction.id) {
      this.accountingService.deleteJournalEntry(this.entryToAction.id).subscribe({
        next: () => {
          this.notificationService.success('Journal entry deleted successfully');
          this.showDeleteConfirm = false;
          this.entryToAction = null;
          this.loadData();
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to delete journal entry');
          this.showDeleteConfirm = false;
        }
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Posted': return 'success';
      case 'Draft': return 'warning';
      default: return 'info';
    }
  }
}
