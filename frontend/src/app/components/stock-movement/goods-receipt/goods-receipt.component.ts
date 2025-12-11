import { Component } from '@angular/core';

@Component({
  selector: 'app-goods-receipt',
  standalone: false,
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.scss']
})
export class GoodsReceiptComponent {
  grnList = [
    { id: 'GRN-001', date: '2024-01-15', supplier: 'Global Supplies Inc.', poRef: 'PO-001', items: 5, totalQty: 150, totalValue: 12500, status: 'Completed' },
    { id: 'GRN-002', date: '2024-01-18', supplier: 'Steel Works Ltd', poRef: 'PO-002', items: 3, totalQty: 500, totalValue: 1000, status: 'Completed' },
    { id: 'GRN-003', date: '2024-01-20', supplier: 'Office Plus', poRef: 'PO-003', items: 8, totalQty: 200, totalValue: 3500, status: 'Pending' },
    { id: 'GRN-004', date: '2024-01-22', supplier: 'Furniture World', poRef: 'PO-004', items: 2, totalQty: 20, totalValue: 4000, status: 'Draft' }
  ];

  showModal: boolean = false;

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Draft': 'badge-info'
    };
    return classes[status] || 'badge-info';
  }
}
