import { Component } from '@angular/core';

@Component({
  selector: 'app-supplier',
  standalone: false,
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent {
  suppliers = [
    { id: 1, code: 'SUP-001', name: 'Global Supplies Inc.', email: 'contact@globalsupplies.com', phone: '+1 234 567 8901', category: 'Electronics', rating: 4.5, status: 'Active' },
    { id: 2, code: 'SUP-002', name: 'Steel Works Ltd', email: 'info@steelworks.com', phone: '+1 234 567 8902', category: 'Raw Materials', rating: 4.2, status: 'Active' },
    { id: 3, code: 'SUP-003', name: 'Office Plus', email: 'sales@officeplus.com', phone: '+1 234 567 8903', category: 'Stationery', rating: 4.8, status: 'Active' },
    { id: 4, code: 'SUP-004', name: 'Furniture World', email: 'order@furnitureworld.com', phone: '+1 234 567 8904', category: 'Furniture', rating: 3.9, status: 'Inactive' }
  ];

  searchQuery: string = '';
  showModal: boolean = false;

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}
