import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountingService, Budget } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-budgets',
  standalone: false,
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  loading = false;
  displayDialog = false;
  isEdit = false;

  newBudget: Partial<Budget> = {};

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.loading = true;
    this.accountingService.getAllBudgets().subscribe({
      next: (data) => {
        this.budgets = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load budgets');
        this.cdr.detectChanges();
      }
    });
  }

  openNewDialog(): void {
    this.isEdit = false;
    this.newBudget = {
      name: '',
      fiscalYear: new Date().getFullYear(),
      budgetType: 'Annual',
      description: '',
      status: 'Draft'
    };
    this.displayDialog = true;
  }

  saveBudget(): void {
    if (!this.newBudget.name) {
      this.notificationService.error('Please enter budget name');
      return;
    }

    this.accountingService.createBudget(this.newBudget as Budget).subscribe({
      next: () => {
        this.notificationService.success(this.isEdit ? 'Budget updated' : 'Budget created');
        this.displayDialog = false;
        this.loadBudgets();
      },
      error: () => {
        this.notificationService.error('Failed to save budget');
        this.cdr.detectChanges();
      }
    });
  }

  editBudget(budget: Budget): void {
    this.isEdit = true;
    this.newBudget = { ...budget };
    this.displayDialog = true;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  calculateVariance(budget: Budget): number {
    return (budget.totalIncome || 0) - (budget.totalExpense || 0);
  }
}
