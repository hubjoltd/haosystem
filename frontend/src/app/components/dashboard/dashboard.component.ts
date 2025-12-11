import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = [
    { icon: 'fas fa-shopping-cart', label: 'Total Orders', value: '2,367', change: '+12%', type: 'primary' },
    { icon: 'fas fa-dollar-sign', label: 'Total Revenue', value: '$93,438.78', change: '+8%', type: 'success' },
    { icon: 'fas fa-users', label: 'Total Customers', value: '39,358', change: '+9%', type: 'info' },
    { icon: 'fas fa-box', label: 'Total Products', value: '1,245', change: '+5%', type: 'warning' }
  ];

  recentOrders = [
    { id: 'ORD-001', customer: 'Sunil Joshi', product: 'Elite Admin', priority: 'Low', amount: '$3.9k' },
    { id: 'ORD-002', customer: 'Andrew McDownland', product: 'Real Homes Theme', priority: 'Medium', amount: '$24.5k' },
    { id: 'ORD-003', customer: 'Christopher Jamil', product: 'MedicalPro Theme', priority: 'High', amount: '$12.8k' },
    { id: 'ORD-004', customer: 'Nirav Joshi', product: 'Hosting Dashboard', priority: 'Critical', amount: '$2.4k' }
  ];

  monthlyEarnings = [
    { month: 'Jan', earnings: 4500 },
    { month: 'Feb', earnings: 5200 },
    { month: 'Mar', earnings: 6100 },
    { month: 'Apr', earnings: 5800 },
    { month: 'May', earnings: 7200 },
    { month: 'Jun', earnings: 8500 }
  ];

  inventoryAlerts = [
    { item: 'Product A', currentStock: 15, reorderLevel: 20, status: 'Low' },
    { item: 'Product B', currentStock: 5, reorderLevel: 25, status: 'Critical' },
    { item: 'Product C', currentStock: 18, reorderLevel: 20, status: 'Low' }
  ];

  constructor() {}

  ngOnInit(): void {}

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'Low': 'badge-success',
      'Medium': 'badge-warning',
      'High': 'badge-danger',
      'Critical': 'badge-danger'
    };
    return classes[priority] || 'badge-info';
  }

  getStatusClass(status: string): string {
    return status === 'Critical' ? 'badge-danger' : 'badge-warning';
  }
}
