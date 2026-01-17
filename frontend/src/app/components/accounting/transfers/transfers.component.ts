import { Component, OnInit } from '@angular/core';
import { AccountingService, BankAccount, AccountTransfer } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-transfers',
  standalone: false,
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.scss']
})
export class TransfersComponent implements OnInit {
  transfers: AccountTransfer[] = [];
  bankAccounts: BankAccount[] = [];
  loading = false;
  displayDialog = false;

  newTransfer: Partial<AccountTransfer> = {};

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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load bank accounts');
      }
    });
  }

  openNewDialog(): void {
    this.newTransfer = {
      amount: 0,
      description: '',
      transferDate: new Date().toISOString().split('T')[0]
    };
    this.displayDialog = true;
  }

  saveTransfer(): void {
    if (!this.newTransfer.fromAccount || !this.newTransfer.toAccount || !this.newTransfer.amount || this.newTransfer.amount <= 0) {
      this.notificationService.error('Please fill all required fields');
      return;
    }

    this.accountingService.createTransfer(this.newTransfer as AccountTransfer).subscribe({
      next: () => {
        this.notificationService.success('Transfer created successfully');
        this.displayDialog = false;
      },
      error: () => {
        this.notificationService.error('Failed to create transfer');
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}
