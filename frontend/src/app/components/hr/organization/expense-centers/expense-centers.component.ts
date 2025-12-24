import { Component, OnInit } from '@angular/core';
import { OrganizationService, ExpenseCenter, CostCenter } from '../../../../services/organization.service';

@Component({
  selector: 'app-expense-centers',
  standalone: false,
  templateUrl: './expense-centers.component.html',
  styleUrls: ['./expense-centers.component.scss']
})
export class ExpenseCentersComponent implements OnInit {
  expenseCenters: ExpenseCenter[] = [];
  costCenters: CostCenter[] = [];
  
  loading = false;
  dataReady = true;
  
  showModal = false;
  isEditMode = false;
  editing: ExpenseCenter = this.getEmpty();

  constructor(private orgService: OrganizationService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    let count = 0;
    const check = () => { count++; if (count >= 2) this.completeLoading(); };
    
    this.orgService.getExpenseCenters().subscribe({
      next: (data) => { this.expenseCenters = data; check(); },
      error: (err) => { console.error('Error loading expense centers:', err); check(); }
    });
    this.orgService.getCostCenters().subscribe({
      next: (data) => { this.costCenters = data; check(); },
      error: (err) => { console.error('Error loading cost centers:', err); check(); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
  }

  getEmpty(): ExpenseCenter {
    return { code: '', name: '', description: '', active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmpty();
    this.showModal = true;
  }

  openEditModal(item: ExpenseCenter) {
    this.isEditMode = true;
    this.editing = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateExpenseCenter(this.editing.id, this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.orgService.createExpenseCenter(this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  delete(item: ExpenseCenter) {
    if (item.id && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.orgService.deleteExpenseCenter(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
