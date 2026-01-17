import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountingService, BankAccount, Reconciliation } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-reconciliation',
  standalone: false,
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss']
})
export class ReconciliationComponent implements OnInit {
  reconciliations: Reconciliation[] = [];
  bankAccounts: BankAccount[] = [];
  loading = false;
  displayDialog = false;

  newReconciliation: Partial<Reconciliation> = {};

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
    this.accountingService.getAllBankAccounts().subscribe({
      next: (accounts) => {
        this.bankAccounts = accounts;
        this.cdr.detectChanges();
        this.loadReconciliations();
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load accounts');
        this.cdr.detectChanges();
      }
    });
  }

  loadReconciliations(): void {
    this.accountingService.getAllReconciliations().subscribe({
      next: (data) => {
        this.reconciliations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load reconciliations');
        this.cdr.detectChanges();
      }
    });
  }

  openNewDialog(): void {
    this.newReconciliation = {
      statementDate: new Date().toISOString().split('T')[0],
      statementEndingBalance: 0,
      notes: ''
    };
    this.displayDialog = true;
  }

  startReconciliation(): void {
    if (!this.newReconciliation.bankAccount) {
      this.notificationService.error('Please select a bank account');
      return;
    }

    this.accountingService.createReconciliation(this.newReconciliation as Reconciliation).subscribe({
      next: () => {
        this.notificationService.success('Reconciliation started');
        this.displayDialog = false;
        this.loadReconciliations();
      },
      error: () => {
        this.notificationService.error('Failed to start reconciliation');
        this.cdr.detectChanges();
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'InProgress': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }
}
