import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-settings',
  standalone: false,
  templateUrl: './customer-settings.component.html',
  styleUrls: ['./customer-settings.component.scss']
})
export class CustomerSettingsComponent {
  customerGroups = [
    { id: 1, name: 'Retail', description: 'Retail customers', discount: 0 },
    { id: 2, name: 'Wholesale', description: 'Wholesale buyers', discount: 10 },
    { id: 3, name: 'VIP', description: 'Premium customers', discount: 15 },
    { id: 4, name: 'Corporate', description: 'Business accounts', discount: 12 }
  ];

  customerStatuses = [
    { id: 1, name: 'Active', color: '#28a745' },
    { id: 2, name: 'Inactive', color: '#6c757d' },
    { id: 3, name: 'Pending', color: '#ffc107' },
    { id: 4, name: 'Blocked', color: '#dc3545' }
  ];

  showModal: boolean = false;
  modalType: string = '';

  openModal(type: string) {
    this.modalType = type;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
