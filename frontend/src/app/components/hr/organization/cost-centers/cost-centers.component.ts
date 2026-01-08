import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrganizationService, CostCenter } from '../../../../services/organization.service';

@Component({
  selector: 'app-cost-centers',
  standalone: false,
  templateUrl: './cost-centers.component.html',
  styleUrls: ['./cost-centers.component.scss']
})
export class CostCentersComponent implements OnInit {
  costCenters: CostCenter[] = [];
  
  loading = false;
  dataReady = false;
  saving = false;
  
  showModal = false;
  isEditMode = false;
  editing: CostCenter = this.getEmpty();

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.dataReady = false;
    this.orgService.getCostCenters().subscribe({
      next: (data) => { this.costCenters = data; this.completeLoading(); },
      error: (err) => { console.error('Error loading cost centers:', err); this.completeLoading(); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
    this.cdr.detectChanges();
  }

  getEmpty(): CostCenter {
    return { code: '', name: '', description: '', active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmpty();
    this.showModal = true;
  }

  openEditModal(item: CostCenter) {
    this.isEditMode = true;
    this.editing = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateCostCenter(this.editing.id, this.editing).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Error updating:', err); }
      });
    } else {
      this.orgService.createCostCenter(this.editing).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Error creating:', err); }
      });
    }
  }

  delete(item: CostCenter) {
    if (item.id && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.orgService.deleteCostCenter(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
