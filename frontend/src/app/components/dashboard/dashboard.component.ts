import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { ItemService, Item } from '../../services/item.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: { icon: string; label: string; value: string; change: string; type: string }[] = [];
  dashboardStats: DashboardStats | null = null;
  lowStockItems: Item[] = [];
  loading = false;
  dataReady = true;
  private subscriptionCount = 0;
  private expectedSubscriptions = 2;

  constructor(
    private dashboardService: DashboardService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private incrementAndCheck(): void {
    this.subscriptionCount++;
    if (this.subscriptionCount >= this.expectedSubscriptions) {
      this.loading = false;
      this.dataReady = true;
    }
  }

  loadDashboardData(): void {
    this.loading = false;
    this.dataReady = true;
    this.subscriptionCount = 0;

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.dashboardStats = data;
        this.stats = [
          { icon: 'fas fa-users', label: 'Total Customers', value: data.totalCustomers?.toString() || '0', change: '', type: 'primary' },
          { icon: 'fas fa-file-contract', label: 'Total Contracts', value: data.totalContracts?.toString() || '0', change: '', type: 'success' },
          { icon: 'fas fa-box', label: 'Total Items', value: data.totalItems?.toString() || '0', change: '', type: 'info' },
          { icon: 'fas fa-dollar-sign', label: 'Inventory Value', value: '$' + (data.totalInventoryValue?.toLocaleString() || '0'), change: '', type: 'warning' }
        ];
        this.incrementAndCheck();
      },
      error: (err) => {
        console.error('Error loading dashboard stats', err);
        this.stats = [
          { icon: 'fas fa-users', label: 'Total Customers', value: '0', change: '', type: 'primary' },
          { icon: 'fas fa-file-contract', label: 'Total Contracts', value: '0', change: '', type: 'success' },
          { icon: 'fas fa-box', label: 'Total Items', value: '0', change: '', type: 'info' },
          { icon: 'fas fa-dollar-sign', label: 'Inventory Value', value: '$0', change: '', type: 'warning' }
        ];
        this.incrementAndCheck();
      }
    });

    this.itemService.getLowStock().subscribe({
      next: (items) => {
        this.lowStockItems = items;
        this.incrementAndCheck();
      },
      error: (err) => {
        console.error('Error loading low stock items', err);
        this.incrementAndCheck();
      }
    });
  }

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
