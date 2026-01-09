import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrganizationService, CostCenter } from '../../../../services/organization.service';
import { ToastService } from '../../../../services/toast.service';

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

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef, private toastService: ToastService) {}

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
        next: () => { 
          this.saving = false; 
          this.cdr.detectChanges();
          this.toastService.success('Cost Center updated successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error updating:', err); 
          this.toastService.error('Failed to update cost center');
        }
      });
    } else {
      this.orgService.createCostCenter(this.editing).subscribe({
        next: () => { 
          this.saving = false; 
          this.cdr.detectChanges();
          this.toastService.success('Cost Center created successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error creating:', err); 
          this.toastService.error('Failed to create cost center');
        }
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
