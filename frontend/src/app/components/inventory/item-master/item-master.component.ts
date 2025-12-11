import { Component } from '@angular/core';

@Component({
  selector: 'app-item-master',
  standalone: false,
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.scss']
})
export class ItemMasterComponent {
  items = [
    { id: 1, code: 'ITM-001', name: 'Laptop Dell XPS', group: 'Electronics', unit: 'Pcs', costPrice: 800, sellPrice: 1200, stock: 25, status: 'Active' },
    { id: 2, code: 'ITM-002', name: 'Office Chair', group: 'Furniture', unit: 'Pcs', costPrice: 150, sellPrice: 250, stock: 40, status: 'Active' },
    { id: 3, code: 'ITM-003', name: 'A4 Paper Ream', group: 'Stationery', unit: 'Ream', costPrice: 5, sellPrice: 8, stock: 500, status: 'Active' },
    { id: 4, code: 'ITM-004', name: 'Steel Sheet', group: 'Raw Materials', unit: 'Kg', costPrice: 2, sellPrice: 3.5, stock: 1000, status: 'Active' },
    { id: 5, code: 'ITM-005', name: 'Cardboard Box', group: 'Packaging', unit: 'Pcs', costPrice: 0.5, sellPrice: 1, stock: 2000, status: 'Low Stock' }
  ];

  searchQuery: string = '';
  showModal: boolean = false;

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  getStockClass(status: string): string {
    return status === 'Low Stock' ? 'badge-warning' : 'badge-success';
  }
}
