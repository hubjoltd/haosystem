import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseRequest, ExpenseItem, ExpenseCategory, EXPENSE_TYPES, PAYMENT_METHODS } from '../../../models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss'
})
export class ExpenseFormComponent implements OnInit {
  expenseRequest: Partial<ExpenseRequest> = {
    title: '',
    description: '',
    items: [],
    reimbursementRequired: true
  };
  
  categories: ExpenseCategory[] = [];
  expenseTypes = EXPENSE_TYPES;
  paymentMethods = PAYMENT_METHODS;
  
  isEditing = false;
  expenseId: number | null = null;
  loading = false;
  saving = false;
  
  showItemModal = false;
  editingItemIndex: number = -1;
  itemForm: Partial<ExpenseItem> = {};

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.expenseId = parseInt(id);
      this.isEditing = true;
      this.loadExpense();
    }
  }

  loadCategories(): void {
    this.expenseService.getActiveCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadExpense(): void {
    if (!this.expenseId) return;
    
    this.loading = true;
    this.expenseService.getRequestById(this.expenseId).subscribe({
      next: (data) => {
        this.expenseRequest = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading expense:', err);
        this.loading = false;
      }
    });
  }

  openItemModal(index: number = -1): void {
    this.editingItemIndex = index;
    if (index >= 0 && this.expenseRequest.items) {
      this.itemForm = { ...this.expenseRequest.items[index] };
    } else {
      this.itemForm = {
        description: '',
        amount: 0,
        currency: 'USD',
        quantity: 1,
        paymentMethod: 'CASH',
        expenseDate: new Date().toISOString().split('T')[0]
      };
    }
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
    this.itemForm = {};
    this.editingItemIndex = -1;
  }

  saveItem(): void {
    if (!this.expenseRequest.items) {
      this.expenseRequest.items = [];
    }
    
    if (this.editingItemIndex >= 0) {
      this.expenseRequest.items[this.editingItemIndex] = { ...this.itemForm } as ExpenseItem;
    } else {
      this.expenseRequest.items.push({ ...this.itemForm } as ExpenseItem);
    }
    
    this.calculateTotal();
    this.closeItemModal();
  }

  removeItem(index: number): void {
    if (this.expenseRequest.items) {
      this.expenseRequest.items.splice(index, 1);
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    if (this.expenseRequest.items) {
      this.expenseRequest.totalAmount = this.expenseRequest.items.reduce(
        (sum, item) => sum + (item.amount || 0), 0
      );
    }
  }

  saveExpense(): void {
    this.saving = true;
    
    const data = {
      ...this.expenseRequest,
      items: this.expenseRequest.items?.map(item => ({
        ...item,
        categoryId: item.category?.id || item.categoryId
      }))
    };
    
    if (this.isEditing && this.expenseId) {
      this.expenseService.updateRequest(this.expenseId, data).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/app/expenses']);
        },
        error: (err) => {
          console.error('Error updating expense:', err);
          this.saving = false;
          alert('Failed to save expense');
        }
      });
    } else {
      this.expenseService.createRequest(data).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/app/expenses']);
        },
        error: (err) => {
          console.error('Error creating expense:', err);
          this.saving = false;
          alert('Failed to create expense');
        }
      });
    }
  }

  submitExpense(): void {
    if (!this.expenseId) {
      this.expenseService.createRequest(this.expenseRequest).subscribe({
        next: (created) => {
          this.expenseService.submitRequest(created.id!).subscribe({
            next: () => this.router.navigate(['/app/expenses']),
            error: (err) => {
              console.error('Error submitting expense:', err);
              alert('Expense created but failed to submit');
            }
          });
        },
        error: (err) => {
          console.error('Error creating expense:', err);
          alert('Failed to create expense');
        }
      });
    } else {
      this.expenseService.submitRequest(this.expenseId).subscribe({
        next: () => this.router.navigate(['/app/expenses']),
        error: (err) => {
          console.error('Error submitting expense:', err);
          alert('Failed to submit expense');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/expenses']);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  getPaymentMethodLabel(method: string): string {
    const found = this.paymentMethods.find(m => m.value === method);
    return found ? found.label : method;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }
}
