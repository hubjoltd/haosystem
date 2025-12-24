import { Component, OnInit } from '@angular/core';
import { OrganizationService, Department, CostCenter, Location } from '../../../../services/organization.service';

@Component({
  selector: 'app-departments',
  standalone: false,
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  costCenters: CostCenter[] = [];
  locations: Location[] = [];
  
  loading = true;
  dataReady = false;
  
  showModal = false;
  isEditMode = false;
  editing: Department = this.getEmptyDepartment();

  constructor(private orgService: OrganizationService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    let loadedCount = 0;
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= 3) {
        this.completeLoading();
      }
    };
    
    this.orgService.getDepartments().subscribe({
      next: (data) => { this.departments = data; checkComplete(); },
      error: (err) => { console.error('Error loading departments:', err); checkComplete(); }
    });
    this.orgService.getCostCenters().subscribe({
      next: (data) => { this.costCenters = data; checkComplete(); },
      error: (err) => { console.error('Error loading cost centers:', err); checkComplete(); }
    });
    this.orgService.getLocations().subscribe({
      next: (data) => { this.locations = data; checkComplete(); },
      error: (err) => { console.error('Error loading locations:', err); checkComplete(); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
  }

  getEmptyDepartment(): Department {
    return { code: '', name: '', description: '', active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmptyDepartment();
    this.showModal = true;
  }

  openEditModal(item: Department) {
    this.isEditMode = true;
    this.editing = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateDepartment(this.editing.id, this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.orgService.createDepartment(this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  delete(item: Department) {
    if (item.id && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.orgService.deleteDepartment(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
