import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrganizationService, Designation, Grade } from '../../../../services/organization.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-designations',
  standalone: false,
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.scss']
})
export class DesignationsComponent implements OnInit {
  designations: Designation[] = [];
  grades: Grade[] = [];
  
  loading = false;
  saving = false;
  dataReady = false;
  
  showModal = false;
  isEditMode = false;
  editing: Designation = this.getEmpty();

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef, private toastService: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.dataReady = false;
    let count = 0;
    const total = 2;
    const check = () => { 
      count++; 
      if (count >= total) {
        this.loading = false;
        this.dataReady = true;
        this.cdr.detectChanges();
      }
    };
    
    this.orgService.getDesignations().subscribe({
      next: (data) => { this.designations = data; check(); },
      error: (err) => { console.error('Error loading designations:', err); check(); }
    });
    this.orgService.getGrades().subscribe({
      next: (data) => { this.grades = data; check(); },
      error: (err) => { console.error('Error loading grades:', err); check(); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
    this.cdr.detectChanges();
  }

  getEmpty(): Designation {
    return { code: '', title: '', description: '', active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmpty();
    this.showModal = true;
  }

  openEditModal(item: Designation) {
    this.isEditMode = true;
    this.editing = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.saving) return;
    
    if (!this.editing.code || !this.editing.title) {
      this.toastService.warning('Please fill in code and title');
      return;
    }
    
    this.saving = true;
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateDesignation(this.editing.id, this.editing).subscribe({
        next: () => { 
          this.saving = false;
          this.cdr.detectChanges();
          this.toastService.success('Designation updated successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          console.error('Error updating:', err); 
          this.saving = false;
          this.cdr.detectChanges();
          this.toastService.error('Failed to update designation');
        }
      });
    } else {
      this.orgService.createDesignation(this.editing).subscribe({
        next: () => { 
          this.saving = false;
          this.cdr.detectChanges();
          this.toastService.success('Designation created successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          console.error('Error creating:', err); 
          this.saving = false;
          this.cdr.detectChanges();
          this.toastService.error('Failed to create designation');
        }
      });
    }
  }

  delete(item: Designation) {
    if (item.id && confirm(`Are you sure you want to delete "${item.title}"?`)) {
      this.orgService.deleteDesignation(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
