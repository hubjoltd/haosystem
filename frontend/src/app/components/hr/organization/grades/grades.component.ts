import { Component, OnInit } from '@angular/core';
import { OrganizationService, Grade } from '../../../../services/organization.service';

@Component({
  selector: 'app-grades',
  standalone: false,
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})
export class GradesComponent implements OnInit {
  grades: Grade[] = [];
  
  showModal = false;
  isEditMode = false;
  editing: Grade = this.getEmpty();

  constructor(private orgService: OrganizationService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.orgService.getGrades().subscribe({
      next: (data) => this.grades = data,
      error: (err) => console.error('Error loading grades:', err)
    });
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
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateGrade(this.editing.id, this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.orgService.createGrade(this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error creating:', err)
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
