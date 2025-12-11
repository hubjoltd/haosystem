import { Component } from '@angular/core';

@Component({
  selector: 'app-goods-issue',
  standalone: false,
  templateUrl: './goods-issue.component.html',
  styleUrls: ['./goods-issue.component.scss']
})
export class GoodsIssueComponent {
  issueList = [
    { id: 'ISS-001', date: '2024-01-16', department: 'Production', requestedBy: 'John Smith', items: 3, totalQty: 50, status: 'Completed' },
    { id: 'ISS-002', date: '2024-01-17', department: 'Sales', requestedBy: 'Sarah Johnson', items: 5, totalQty: 25, status: 'Completed' },
    { id: 'ISS-003', date: '2024-01-19', department: 'R&D', requestedBy: 'Mike Wilson', items: 2, totalQty: 10, status: 'Pending' },
    { id: 'ISS-004', date: '2024-01-21', department: 'Admin', requestedBy: 'Emily Brown', items: 8, totalQty: 100, status: 'Draft' }
  ];

  showModal: boolean = false;
  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = { 'Completed': 'badge-success', 'Pending': 'badge-warning', 'Draft': 'badge-info' };
    return classes[status] || 'badge-info';
  }
}
