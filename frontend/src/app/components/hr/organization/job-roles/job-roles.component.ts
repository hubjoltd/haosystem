import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrganizationService, JobRole, Department, Grade } from '../../../../services/organization.service';

@Component({
  selector: 'app-job-roles',
  standalone: false,
  templateUrl: './job-roles.component.html',
  styleUrls: ['./job-roles.component.scss']
})
export class JobRolesComponent implements OnInit {
  jobRoles: JobRole[] = [];
  departments: Department[] = [];
  grades: Grade[] = [];
  
  loading = false;
  dataReady = false;
  saving = false;
  
  showModal = false;
  isEditMode = false;
  editing: JobRole = this.getEmpty();

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.orgService.getJobRoles().subscribe({
      next: (data) => { this.jobRoles = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Error loading job roles:', err); }
    });
    this.orgService.getDepartments().subscribe({
      next: (data) => { this.departments = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Error loading departments:', err); }
    });
    this.orgService.getGrades().subscribe({
      next: (data) => { this.grades = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Error loading grades:', err); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
    this.cdr.detectChanges();
  }

  getEmpty(): JobRole {
    return { code: '', title: '', description: '', active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmpty();
    this.showModal = true;
  }

  openEditModal(item: JobRole) {
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
      this.orgService.updateJobRole(this.editing.id, this.editing).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Error updating:', err); }
      });
    } else {
      this.orgService.createJobRole(this.editing).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Error creating:', err); }
      });
    }
  }

  delete(item: JobRole) {
    if (item.id && confirm(`Are you sure you want to delete "${item.title}"?`)) {
      this.orgService.deleteJobRole(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
