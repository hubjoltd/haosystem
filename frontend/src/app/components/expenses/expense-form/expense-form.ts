import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ExpenseService } from '../../../services/expense.service';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import { ExpenseRequest, ExpenseItem, ExpenseCategory, EXPENSE_TYPES, PAYMENT_METHODS } from '../../../models/expense.model';

interface ExpenseItemForm extends Partial<ExpenseItem> {
  expenseType?: string;
  categoryId?: number;
  receiptFileName?: string;
  receiptFileData?: string;
}

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
  
  expenseTypesList: { id: number; name: string; active: boolean }[] = [];
  projects: Project[] = [];
  
  isEditing = false;
  expenseId: number | null = null;
  loading = false;
  saving = false;
  
  showItemModal = false;
  editingItemIndex: number = -1;
  itemForm: ExpenseItemForm = {};

  constructor(
    private expenseService: ExpenseService,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadExpenseTypes();
    this.loadProjects();
    
    // Subscribe to route params for proper data loading on navigation
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.expenseId = parseInt(id);
        this.isEditing = true;
        this.loadExpense();
      }
    });
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (data) => this.projects = data.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS'),
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  loadExpenseTypes(): void {
    const stored = localStorage.getItem('expenseTypes');
    if (stored) {
      this.expenseTypesList = JSON.parse(stored).filter((t: any) => t.active);
    } else {
      this.expenseTypesList = [
        { id: 1, name: 'Food Expense', active: true },
        { id: 2, name: 'Travel Expense', active: true },
        { id: 3, name: 'Accommodation', active: true },
        { id: 4, name: 'Transportation', active: true },
        { id: 5, name: 'Office Supplies', active: true },
        { id: 6, name: 'Equipment', active: true },
        { id: 7, name: 'Software/Subscription', active: true },
        { id: 8, name: 'Communication', active: true },
        { id: 9, name: 'Entertainment', active: true },
        { id: 10, name: 'Medical', active: true },
        { id: 11, name: 'Training/Education', active: true },
        { id: 12, name: 'Miscellaneous', active: true }
      ];
      localStorage.setItem('expenseTypes', JSON.stringify(this.expenseTypesList));
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
      this.itemForm = { ...this.expenseRequest.items[index] } as ExpenseItemForm;
    } else {
      this.itemForm = {
        expenseType: '',
        categoryId: undefined,
        description: '',
        amount: 0,
        receiptFileName: '',
        receiptFileData: ''
      };
    }
    this.showItemModal = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File): void {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (JPG, PNG, GIF, WebP) and PDF files are allowed');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      this.itemForm.receiptFileName = file.name;
      this.itemForm.receiptFileData = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.itemForm.receiptFileName = '';
    this.itemForm.receiptFileData = '';
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
