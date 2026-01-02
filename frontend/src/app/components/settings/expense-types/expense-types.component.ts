import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ExpenseType {
  id: number;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-expense-types-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-types.component.html',
  styleUrl: './expense-types.component.scss'
})
export class ExpenseTypesSettingsComponent implements OnInit {
  expenseTypes: ExpenseType[] = [];
  showModal = false;
  editMode = false;
  selectedType: ExpenseType = { id: 0, name: '', active: true };

  ngOnInit(): void {
    this.loadExpenseTypes();
  }

  loadExpenseTypes(): void {
    const stored = localStorage.getItem('expenseTypes');
    if (stored) {
      this.expenseTypes = JSON.parse(stored);
    } else {
      this.expenseTypes = [
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
      this.saveToStorage();
    }
  }

  saveToStorage(): void {
    localStorage.setItem('expenseTypes', JSON.stringify(this.expenseTypes));
  }

  openModal(type?: ExpenseType): void {
    if (type) {
      this.editMode = true;
      this.selectedType = { ...type };
    } else {
      this.editMode = false;
      this.selectedType = { id: 0, name: '', active: true };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedType = { id: 0, name: '', active: true };
  }

  saveType(): void {
    if (!this.selectedType.name.trim()) return;

    if (this.editMode) {
      const index = this.expenseTypes.findIndex(t => t.id === this.selectedType.id);
      if (index !== -1) {
        this.expenseTypes[index] = { ...this.selectedType };
      }
    } else {
      const maxId = Math.max(...this.expenseTypes.map(t => t.id), 0);
      this.selectedType.id = maxId + 1;
      this.expenseTypes.push({ ...this.selectedType });
    }
    this.saveToStorage();
    this.closeModal();
  }

  toggleStatus(type: ExpenseType): void {
    type.active = !type.active;
    this.saveToStorage();
  }

  deleteType(id: number): void {
    if (confirm('Are you sure you want to delete this expense type?')) {
      this.expenseTypes = this.expenseTypes.filter(t => t.id !== id);
      this.saveToStorage();
    }
  }
}
