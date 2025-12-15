import { Component, OnInit } from '@angular/core';
import { CustomerSettingsService, CustomerGroup, CustomerStatus } from '../../../services/customer-settings.service';

@Component({
  selector: 'app-customer-settings',
  standalone: false,
  templateUrl: './customer-settings.component.html',
  styleUrls: ['./customer-settings.component.scss']
})
export class CustomerSettingsComponent implements OnInit {
  customerGroups: CustomerGroup[] = [];
  customerStatuses: CustomerStatus[] = [];

  showModal: boolean = false;
  modalType: string = '';
  isEditMode: boolean = false;
  
  editingGroup: CustomerGroup = { name: '', description: '', discount: 0 };
  editingStatus: CustomerStatus = { name: '', color: '#28a745' };

  constructor(private customerSettingsService: CustomerSettingsService) {}

  ngOnInit() {
    this.loadGroups();
    this.loadStatuses();
  }

  loadGroups() {
    this.customerSettingsService.getGroups().subscribe({
      next: (groups) => this.customerGroups = groups,
      error: (err) => console.error('Error loading groups:', err)
    });
  }

  loadStatuses() {
    this.customerSettingsService.getStatuses().subscribe({
      next: (statuses) => this.customerStatuses = statuses,
      error: (err) => console.error('Error loading statuses:', err)
    });
  }

  openModal(type: string) {
    this.modalType = type;
    this.isEditMode = false;
    if (type === 'group') {
      this.editingGroup = { name: '', description: '', discount: 0 };
    } else {
      this.editingStatus = { name: '', color: '#28a745' };
    }
    this.showModal = true;
  }

  openEditModal(type: string, item: any) {
    this.modalType = type;
    this.isEditMode = true;
    if (type === 'group') {
      this.editingGroup = { ...item };
    } else {
      this.editingStatus = { ...item };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveGroup() {
    if (this.isEditMode && this.editingGroup.id) {
      this.customerSettingsService.updateGroup(this.editingGroup.id, this.editingGroup).subscribe({
        next: () => {
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => console.error('Error updating group:', err)
      });
    } else {
      this.customerSettingsService.createGroup(this.editingGroup).subscribe({
        next: () => {
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => console.error('Error creating group:', err)
      });
    }
  }

  saveStatus() {
    if (this.isEditMode && this.editingStatus.id) {
      this.customerSettingsService.updateStatus(this.editingStatus.id, this.editingStatus).subscribe({
        next: () => {
          this.loadStatuses();
          this.closeModal();
        },
        error: (err) => console.error('Error updating status:', err)
      });
    } else {
      this.customerSettingsService.createStatus(this.editingStatus).subscribe({
        next: () => {
          this.loadStatuses();
          this.closeModal();
        },
        error: (err) => console.error('Error creating status:', err)
      });
    }
  }

  deleteGroup(group: CustomerGroup) {
    if (group.id && confirm(`Are you sure you want to delete "${group.name}"?`)) {
      this.customerSettingsService.deleteGroup(group.id).subscribe({
        next: () => this.loadGroups(),
        error: (err) => console.error('Error deleting group:', err)
      });
    }
  }

  deleteStatus(status: CustomerStatus) {
    if (status.id && confirm(`Are you sure you want to delete "${status.name}"?`)) {
      this.customerSettingsService.deleteStatus(status.id).subscribe({
        next: () => this.loadStatuses(),
        error: (err) => console.error('Error deleting status:', err)
      });
    }
  }
}
