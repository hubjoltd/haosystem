import { Component, OnInit } from '@angular/core';
import { ContractService, Contract } from '../../services/contract.service';
import { CustomerService, Customer } from '../../services/customer.service';

@Component({
  selector: 'app-contract-management',
  standalone: false,
  templateUrl: './contract-management.component.html',
  styleUrls: ['./contract-management.component.scss']
})
export class ContractManagementComponent implements OnInit {
  contracts: Contract[] = [];
  customers: Customer[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedContract: Contract = this.getEmptyContract();
  loading = false;
  dataReady = false;
  private subscriptionCount = 0;
  private expectedSubscriptions = 2;

  constructor(
    private contractService: ContractService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private incrementAndCheck(): void {
    this.subscriptionCount++;
    if (this.subscriptionCount >= this.expectedSubscriptions) {
      this.loading = false;
      this.dataReady = true;
    }
  }

  loadData(): void {
    this.loading = false;
    this.dataReady = true;
    this.subscriptionCount = 0;

    this.contractService.getAll().subscribe({
      next: (data) => {
        this.contracts = data;
        this.incrementAndCheck();
      },
      error: (err) => {
        console.error('Error loading contracts', err);
        this.incrementAndCheck();
      }
    });

    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.incrementAndCheck();
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.incrementAndCheck();
      }
    });
  }

  get filteredContracts() {
    if (!this.searchQuery) return this.contracts;
    return this.contracts.filter(c => 
      c.contractNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getEmptyContract(): Contract {
    return {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      value: 0,
      status: 'Active',
      paymentTerms: ''
    };
  }

  openModal(contract?: Contract) {
    if (contract) {
      this.editMode = true;
      this.selectedContract = { ...contract };
    } else {
      this.editMode = false;
      this.selectedContract = this.getEmptyContract();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedContract = this.getEmptyContract();
  }

  saveContract(): void {
    if (this.editMode && this.selectedContract.id) {
      this.contractService.update(this.selectedContract.id, this.selectedContract).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error updating contract', err)
      });
    } else {
      this.contractService.create(this.selectedContract).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error creating contract', err)
      });
    }
  }

  deleteContract(id: number): void {
    if (confirm('Are you sure you want to delete this contract?')) {
      this.contractService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting contract', err)
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'badge-success',
      'Pending': 'badge-warning',
      'Completed': 'badge-info',
      'Expired': 'badge-danger',
      'Cancelled': 'badge-secondary'
    };
    return classes[status] || 'badge-info';
  }

  getTotalValue(): number {
    return this.contracts.reduce((sum, c) => sum + (c.value || 0), 0);
  }

  getActiveCount(): number {
    return this.contracts.filter(c => c.status === 'Active').length;
  }

  getPendingCount(): number {
    return this.contracts.filter(c => c.status === 'Pending').length;
  }
}
