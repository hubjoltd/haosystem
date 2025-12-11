import { Component } from '@angular/core';

@Component({
  selector: 'app-group-master',
  standalone: false,
  templateUrl: './group-master.component.html',
  styleUrls: ['./group-master.component.scss']
})
export class GroupMasterComponent {
  groups = [
    { id: 1, code: 'GRP-001', name: 'Electronics', description: 'Electronic items and gadgets', itemCount: 45, status: 'Active' },
    { id: 2, code: 'GRP-002', name: 'Furniture', description: 'Office and home furniture', itemCount: 32, status: 'Active' },
    { id: 3, code: 'GRP-003', name: 'Stationery', description: 'Office stationery supplies', itemCount: 78, status: 'Active' },
    { id: 4, code: 'GRP-004', name: 'Raw Materials', description: 'Manufacturing raw materials', itemCount: 56, status: 'Active' },
    { id: 5, code: 'GRP-005', name: 'Packaging', description: 'Packaging materials', itemCount: 23, status: 'Inactive' }
  ];

  searchQuery: string = '';
  showModal: boolean = false;

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }
}
