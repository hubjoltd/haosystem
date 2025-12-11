import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory-ledger',
  standalone: false,
  templateUrl: './inventory-ledger.component.html',
  styleUrls: ['./inventory-ledger.component.scss']
})
export class InventoryLedgerComponent {
  ledgerEntries = [
    { id: 1, date: '2024-01-15', docNo: 'GRN-001', item: 'Laptop Dell XPS', type: 'Receipt', inQty: 10, outQty: 0, balance: 25, value: 8000 },
    { id: 2, date: '2024-01-16', docNo: 'ISS-001', item: 'Office Chair', type: 'Issue', inQty: 0, outQty: 5, balance: 35, value: -750 },
    { id: 3, date: '2024-01-17', docNo: 'TRF-001', item: 'A4 Paper Ream', type: 'Transfer', inQty: 0, outQty: 50, balance: 450, value: -250 },
    { id: 4, date: '2024-01-18', docNo: 'ADJ-001', item: 'Steel Sheet', type: 'Adjustment', inQty: 0, outQty: 10, balance: 990, value: -20 },
    { id: 5, date: '2024-01-19', docNo: 'GRN-002', item: 'Cardboard Box', type: 'Receipt', inQty: 500, outQty: 0, balance: 2500, value: 250 }
  ];

  selectedItem: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Receipt': 'badge-success',
      'Issue': 'badge-danger',
      'Transfer': 'badge-info',
      'Adjustment': 'badge-warning'
    };
    return classes[type] || 'badge-info';
  }
}
