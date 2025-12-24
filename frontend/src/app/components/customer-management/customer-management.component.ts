import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CustomerService, Customer } from '../../services/customer.service';

@Component({
  selector: 'app-customer-management',
  standalone: false,
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent implements OnInit {
  customers: Customer[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedCustomer: Customer = this.getEmptyCustomer();
  loading = false;
  dataReady = false;

  constructor(private customerService: CustomerService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  private completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
  }

  loadCustomers(): void {
    this.loading = false;
    this.dataReady = true;
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.completeLoading();
      }
    });
  }

  get filteredCustomers() {
    if (!this.searchQuery) return this.customers;
    return this.customers.filter(c => 
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getEmptyCustomer(): Customer {
    return {
      name: '',
      email: '',
      phone: '',
      address: '',
      customerGroup: '',
      status: 'Active'
    };
  }

  openModal(customer?: Customer) {
    if (customer) {
      this.editMode = true;
      this.selectedCustomer = { ...customer };
    } else {
      this.editMode = false;
      this.selectedCustomer = this.getEmptyCustomer();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCustomer = this.getEmptyCustomer();
  }

  saveCustomer(): void {
    if (this.editMode && this.selectedCustomer.id) {
      this.customerService.update(this.selectedCustomer.id, this.selectedCustomer).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error updating customer', err)
      });
    } else {
      this.customerService.create(this.selectedCustomer).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error creating customer', err)
      });
    }
  }

  deleteCustomer(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.delete(id).subscribe({
        next: () => this.loadCustomers(),
        error: (err) => console.error('Error deleting customer', err)
      });
    }
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'badge-success' : 'badge-danger';
  }

  getActiveCount(): number {
    return this.customers.filter(c => c.status === 'Active').length;
  }

  getInactiveCount(): number {
    return this.customers.filter(c => c.status === 'Inactive').length;
  }
}
