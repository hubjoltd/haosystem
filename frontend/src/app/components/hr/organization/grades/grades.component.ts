import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService, Grade } from '../../../../services/organization.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-grades',
  standalone: false,
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradesComponent implements OnInit {
  grades: Grade[] = [];
  
  loading = false;
  dataReady = false;
  saving = false;
  
  showModal = false;
  isEditMode = false;
  editing: Grade = this.getEmpty();

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef, private toastService: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.dataReady = false;
    this.orgService.getGrades().subscribe({
      next: (data) => { this.grades = data; this.completeLoading(); },
      error: (err) => { console.error('Error loading grades:', err); this.completeLoading(); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
    this.cdr.detectChanges();
  }

  getEmpty(): Grade {
    return { code: '', name: '', description: '', level: 1, minSalary: 0, maxSalary: 0, active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmpty();
    this.showModal = true;
  }

  openEditModal(item: Grade) {
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
      this.orgService.updateGrade(this.editing.id, this.editing).subscribe({
        next: () => { 
          this.saving = false; 
          this.cdr.detectChanges();
          this.toastService.success('Grade updated successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error updating:', err); 
          this.toastService.error('Failed to update grade');
        }
      });
    } else {
      this.orgService.createGrade(this.editing).subscribe({
        next: () => { 
          this.saving = false; 
          this.cdr.detectChanges();
          this.toastService.success('Grade created successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error creating:', err); 
          this.toastService.error('Failed to create grade');
        }
      });
    }
  }

  delete(item: Grade) {
    if (item.id && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.orgService.deleteGrade(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
