import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-transfer',
  standalone: false,
  templateUrl: './stock-transfer.component.html',
  styleUrls: ['./stock-transfer.component.scss']
})
export class StockTransferComponent {
  transferList = [
    { id: 'TRF-001', date: '2024-01-17', fromWarehouse: 'Main Warehouse', toWarehouse: 'Secondary Warehouse', items: 4, totalQty: 100, status: 'Completed' },
    { id: 'TRF-002', date: '2024-01-19', fromWarehouse: 'Secondary Warehouse', toWarehouse: 'Cold Storage', items: 2, totalQty: 50, status: 'In Transit' },
    { id: 'TRF-003', date: '2024-01-21', fromWarehouse: 'Main Warehouse', toWarehouse: 'Cold Storage', items: 3, totalQty: 75, status: 'Pending' }
  ];

  showModal: boolean = false;
  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = { 'Completed': 'badge-success', 'In Transit': 'badge-info', 'Pending': 'badge-warning' };
    return classes[status] || 'badge-info';
  }
}
