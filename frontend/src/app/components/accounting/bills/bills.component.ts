import { Component, OnInit } from '@angular/core';
import { AccountingService, Bill } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-bills',
  standalone: false,
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss']
})
export class BillsComponent implements OnInit {
  bills: Bill[] = [];
  loading = false;
  searchText = '';
  selectedStatus: string | null = null;
  displayDialog = false;
  isEdit = false;

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Draft', value: 'Draft' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Overdue', value: 'Overdue' }
  ];

  newBill: Partial<Bill> = {};

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.loading = true;
    this.accountingService.getAllBills().subscribe({
      next: (data) => {
        this.bills = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load bills');
      }
    });
  }

  openNewDialog(): void {
    this.isEdit = false;
    this.newBill = {
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      totalAmount: 0,
      status: 'Draft'
    };
    this.displayDialog = true;
  }

  saveBill(): void {
    if (!this.newBill.billNumber) {
      this.notificationService.error('Please fill required fields');
      return;
    }

    this.notificationService.info('Bill functionality coming soon');
    this.displayDialog = false;
  }

  editBill(bill: Bill): void {
    this.isEdit = true;
    this.newBill = { ...bill };
    this.displayDialog = true;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Paid': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Overdue': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
