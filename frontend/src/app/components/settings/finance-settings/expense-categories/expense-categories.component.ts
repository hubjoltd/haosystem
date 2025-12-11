import { Component, OnInit } from '@angular/core';

interface ExpenseCategory {
  id?: number;
  name: string;
  code: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-expense-categories',
  standalone: false,
  templateUrl: './expense-categories.component.html',
  styleUrls: ['./expense-categories.component.scss']
})
export class ExpenseCategoriesComponent implements OnInit {
  expenseCategories: ExpenseCategory[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedCategory: ExpenseCategory = this.getEmptyCategory();
  loading: boolean = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = false;
  }

  getEmptyCategory(): ExpenseCategory {
    return {
      name: '',
      code: '',
      description: '',
      status: 'Active'
    };
  }

  openModal(category?: ExpenseCategory) {
    if (category) {
      this.editMode = true;
      this.selectedCategory = { ...category };
    } else {
      this.editMode = false;
      this.selectedCategory = this.getEmptyCategory();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCategory = this.getEmptyCategory();
  }

  saveCategory(): void {
    if (this.editMode) {
      const index = this.expenseCategories.findIndex(c => c.id === this.selectedCategory.id);
      if (index !== -1) {
        this.expenseCategories[index] = { ...this.selectedCategory };
      }
    } else {
      this.selectedCategory.id = Date.now();
      this.expenseCategories.push({ ...this.selectedCategory });
    }
    this.closeModal();
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this expense category?')) {
      this.expenseCategories = this.expenseCategories.filter(c => c.id !== id);
    }
  }
}
