import { Component, OnInit } from '@angular/core';
import { ContractSettingsService, ContractType, ContractStatus } from '../../../services/contract-settings.service';

@Component({
  selector: 'app-contract-settings',
  standalone: false,
  templateUrl: './contract-settings.component.html',
  styleUrls: ['./contract-settings.component.scss']
})
export class ContractSettingsComponent implements OnInit {
  contractTypes: ContractType[] = [];
  contractStatuses: ContractStatus[] = [];

  showModal: boolean = false;
  modalType: string = '';
  isEditMode: boolean = false;
  
  editingType: ContractType = { name: '', duration: 12, renewable: true };
  editingStatus: ContractStatus = { name: '', color: '#28a745' };

  constructor(private contractSettingsService: ContractSettingsService) {}

  ngOnInit() {
    this.loadTypes();
    this.loadStatuses();
  }

  loadTypes() {
    this.contractSettingsService.getTypes().subscribe({
      next: (types) => this.contractTypes = types,
      error: (err) => console.error('Error loading types:', err)
    });
  }

  loadStatuses() {
    this.contractSettingsService.getStatuses().subscribe({
      next: (statuses) => this.contractStatuses = statuses,
      error: (err) => console.error('Error loading statuses:', err)
    });
  }

  openModal(type: string) {
    this.modalType = type;
    this.isEditMode = false;
    if (type === 'type') {
      this.editingType = { name: '', duration: 12, renewable: true };
    } else {
      this.editingStatus = { name: '', color: '#28a745' };
    }
    this.showModal = true;
  }

  openEditModal(type: string, item: any) {
    this.modalType = type;
    this.isEditMode = true;
    if (type === 'type') {
      this.editingType = { ...item };
    } else {
      this.editingStatus = { ...item };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveType() {
    if (this.isEditMode && this.editingType.id) {
      this.contractSettingsService.updateType(this.editingType.id, this.editingType).subscribe({
        next: () => {
          this.loadTypes();
          this.closeModal();
        },
        error: (err) => console.error('Error updating type:', err)
      });
    } else {
      this.contractSettingsService.createType(this.editingType).subscribe({
        next: () => {
          this.loadTypes();
          this.closeModal();
        },
        error: (err) => console.error('Error creating type:', err)
      });
    }
  }

  saveStatus() {
    if (this.isEditMode && this.editingStatus.id) {
      this.contractSettingsService.updateStatus(this.editingStatus.id, this.editingStatus).subscribe({
        next: () => {
          this.loadStatuses();
          this.closeModal();
        },
        error: (err) => console.error('Error updating status:', err)
      });
    } else {
      this.contractSettingsService.createStatus(this.editingStatus).subscribe({
        next: () => {
          this.loadStatuses();
          this.closeModal();
        },
        error: (err) => console.error('Error creating status:', err)
      });
    }
  }

  deleteType(type: ContractType) {
    if (type.id && confirm(`Are you sure you want to delete "${type.name}"?`)) {
      this.contractSettingsService.deleteType(type.id).subscribe({
        next: () => this.loadTypes(),
        error: (err) => console.error('Error deleting type:', err)
      });
    }
  }

  deleteStatus(status: ContractStatus) {
    if (status.id && confirm(`Are you sure you want to delete "${status.name}"?`)) {
      this.contractSettingsService.deleteStatus(status.id).subscribe({
        next: () => this.loadStatuses(),
        error: (err) => console.error('Error deleting status:', err)
      });
    }
  }
}
