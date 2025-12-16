import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseRequest, EXPENSE_STATUSES, REIMBURSEMENT_STATUSES } from '../../../models/expense.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss'
})
export class ExpenseListComponent implements OnInit {
  expenses: ExpenseRequest[] = [];
  filteredExpenses: ExpenseRequest[] = [];
  expenseStatuses = EXPENSE_STATUSES;
  reimbursementStatuses = REIMBURSEMENT_STATUSES;
  
  loading = false;
  filterStatus = '';
  searchTerm = '';
  viewMode: 'all' | 'pending' | 'approved' | 'reimbursement' = 'all';
  
  statistics: any = {};

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadStatistics();
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getAllRequests().subscribe({
      next: (data) => {
        this.expenses = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    this.expenseService.getStatistics().subscribe({
      next: (data) => this.statistics = data,
      error: (err) => console.error('Error loading statistics:', err)
    });
  }

  applyFilters(): void {
    this.filteredExpenses = this.expenses.filter(expense => {
      const matchesStatus = !this.filterStatus || expense.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || 
        expense.requestNumber?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        expense.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        expense.employee?.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      let matchesView = true;
      switch (this.viewMode) {
        case 'pending':
          matchesView = expense.status === 'PENDING_APPROVAL';
          break;
        case 'approved':
          matchesView = expense.status === 'APPROVED';
          break;
        case 'reimbursement':
          matchesView = expense.status === 'APPROVED' && expense.reimbursementStatus === 'PENDING';
          break;
      }
      
      return matchesStatus && matchesSearch && matchesView;
    });
  }

  setViewMode(mode: 'all' | 'pending' | 'approved' | 'reimbursement'): void {
    this.viewMode = mode;
    this.applyFilters();
  }

  createExpense(): void {
    this.router.navigate(['/app/expenses/new']);
  }

  viewExpense(id: number): void {
    this.router.navigate(['/app/expenses', id]);
  }

  editExpense(id: number): void {
    this.router.navigate(['/app/expenses', id, 'edit']);
  }

  submitExpense(expense: ExpenseRequest): void {
    if (confirm('Submit this expense for approval?')) {
      this.expenseService.submitRequest(expense.id!).subscribe({
        next: () => {
          this.loadExpenses();
          this.loadStatistics();
        },
        error: (err) => {
          console.error('Error submitting expense:', err);
          alert('Failed to submit expense');
        }
      });
    }
  }

  approveExpense(expense: ExpenseRequest): void {
    if (confirm('Approve this expense?')) {
      this.expenseService.approveRequest(expense.id!, { approvedAmount: expense.totalAmount }).subscribe({
        next: () => {
          this.loadExpenses();
          this.loadStatistics();
        },
        error: (err) => {
          console.error('Error approving expense:', err);
          alert('Failed to approve expense');
        }
      });
    }
  }

  rejectExpense(expense: ExpenseRequest): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.expenseService.rejectRequest(expense.id!, reason).subscribe({
        next: () => {
          this.loadExpenses();
          this.loadStatistics();
        },
        error: (err) => {
          console.error('Error rejecting expense:', err);
          alert('Failed to reject expense');
        }
      });
    }
  }

  markReimbursed(expense: ExpenseRequest): void {
    if (confirm('Mark this expense as reimbursed?')) {
      this.expenseService.markReimbursed(expense.id!).subscribe({
        next: () => {
          this.loadExpenses();
          alert('Expense marked as reimbursed');
        },
        error: (err) => {
          console.error('Error marking reimbursed:', err);
          alert('Failed to mark as reimbursed');
        }
      });
    }
  }

  postToAccounts(expense: ExpenseRequest): void {
    const reference = prompt('Enter accounting reference:');
    if (reference) {
      this.expenseService.postToAccounts(expense.id!, reference).subscribe({
        next: () => {
          this.loadExpenses();
          alert('Expense posted to accounts');
        },
        error: (err) => {
          console.error('Error posting to accounts:', err);
          alert('Failed to post to accounts');
        }
      });
    }
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteRequest(id).subscribe({
        next: () => {
          this.loadExpenses();
          this.loadStatistics();
        },
        error: (err) => {
          console.error('Error deleting expense:', err);
          alert('Failed to delete expense');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const found = this.expenseStatuses.find(s => s.value === status);
    return found ? found.label : status;
  }

  getStatusColor(status: string): string {
    const found = this.expenseStatuses.find(s => s.value === status);
    return found ? found.color : 'secondary';
  }

  getReimbursementLabel(status: string): string {
    const found = this.reimbursementStatuses.find(s => s.value === status);
    return found ? found.label : status;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }
}
