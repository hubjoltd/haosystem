import { Component, OnInit } from '@angular/core';
import { OrganizationService, Designation, Grade } from '../../../../services/organization.service';

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
  dataReady = false;
  
  showModal = false;
  isEditMode = false;
  editing: Designation = this.getEmpty();

  constructor(private orgService: OrganizationService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    let count = 0;
    const check = () => { count++; if (count >= 2) this.completeLoading(); };
    
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
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateDesignation(this.editing.id, this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.orgService.createDesignation(this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error creating:', err)
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
