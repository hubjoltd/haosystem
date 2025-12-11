import { Component } from '@angular/core';

@Component({
  selector: 'app-contract-management',
  standalone: false,
  templateUrl: './contract-management.component.html',
  styleUrls: ['./contract-management.component.scss']
})
export class ContractManagementComponent {
  contracts = [
    { id: 'CON-001', customer: 'ABC Corporation', type: 'Service Agreement', startDate: '2024-01-01', endDate: '2024-12-31', value: 50000, status: 'Active' },
    { id: 'CON-002', customer: 'XYZ Industries', type: 'Maintenance Contract', startDate: '2024-03-15', endDate: '2024-09-15', value: 15000, status: 'Active' },
    { id: 'CON-003', customer: 'Global Trading Co.', type: 'Annual Subscription', startDate: '2023-06-01', endDate: '2024-05-31', value: 35000, status: 'Pending Renewal' },
    { id: 'CON-004', customer: 'Tech Solutions Ltd', type: 'One-time Project', startDate: '2024-02-01', endDate: '2024-04-30', value: 25000, status: 'Completed' },
    { id: 'CON-005', customer: 'Local Retail Shop', type: 'Service Agreement', startDate: '2023-01-01', endDate: '2023-12-31', value: 8000, status: 'Expired' }
  ];

  searchQuery: string = '';
  showModal: boolean = false;

  get filteredContracts() {
    if (!this.searchQuery) return this.contracts;
    return this.contracts.filter(c => 
      c.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.customer.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'badge-success',
      'Pending Renewal': 'badge-warning',
      'Completed': 'badge-info',
      'Expired': 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }
}
