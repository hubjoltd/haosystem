import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-management',
  standalone: false,
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent {
  customers = [
    { id: 1, name: 'ABC Corporation', email: 'contact@abc.com', phone: '+1 234 567 8901', group: 'Corporate', balance: 15000, status: 'Active' },
    { id: 2, name: 'XYZ Industries', email: 'info@xyz.com', phone: '+1 234 567 8902', group: 'Wholesale', balance: 8500, status: 'Active' },
    { id: 3, name: 'Global Trading Co.', email: 'sales@global.com', phone: '+1 234 567 8903', group: 'VIP', balance: 25000, status: 'Active' },
    { id: 4, name: 'Local Retail Shop', email: 'shop@local.com', phone: '+1 234 567 8904', group: 'Retail', balance: 1200, status: 'Inactive' },
    { id: 5, name: 'Tech Solutions Ltd', email: 'tech@solutions.com', phone: '+1 234 567 8905', group: 'Corporate', balance: 18000, status: 'Active' }
  ];

  searchQuery: string = '';
  showModal: boolean = false;

  get filteredCustomers() {
    if (!this.searchQuery) return this.customers;
    return this.customers.filter(c => 
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'badge-success' : 'badge-danger';
  }
}
