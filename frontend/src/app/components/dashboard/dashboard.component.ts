import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { ItemService, Item } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: { icon: string; label: string; value: string; change: string; type: string; gradient: string }[] = [];
  dashboardStats: DashboardStats | null = null;
  lowStockItems: Item[] = [];
  loading = false;
  dataReady = false;
  private subscriptionCount = 0;
  private expectedSubscriptions = 2;

  currentDate = new Date();
  daysInMonth: number[] = [];
  monthName = '';
  year = 0;
  events: any[] = [];

  features = [
    { icon: 'fas fa-users', label: 'HR Management', desc: 'Manage employees', route: '/app/hr/employees', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#667eea' },
    { icon: 'fas fa-project-diagram', label: 'Projects', desc: 'Track projects', route: '/app/projects', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', color: '#f093fb' },
    { icon: 'fas fa-calendar-alt', label: 'Calendar', desc: 'Schedule events', route: '/app/calendar', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: '#4facfe' },
    { icon: 'fas fa-user-clock', label: 'Attendance', desc: 'Track attendance', route: '/app/attendance/management', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: '#43e97b' },
    { icon: 'fas fa-money-check-alt', label: 'Payroll', desc: 'Process payroll', route: '/app/payroll/process', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', color: '#fa709a' },
    { icon: 'fas fa-boxes', label: 'Inventory', desc: 'Manage stock', route: '/app/inventory/items', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', color: '#a18cd1' },
    { icon: 'fas fa-file-contract', label: 'Contracts', desc: 'Manage contracts', route: '/app/contracts', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', color: '#fcb69f' },
    { icon: 'fas fa-chart-bar', label: 'Reports', desc: 'View reports', route: '/app/reports/stock-summary', gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', color: '#a1c4fd' },
    { icon: 'fas fa-cog', label: 'Settings', desc: 'System settings', route: '/app/settings/general', gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)', color: '#96e6a1' },
    { icon: 'fas fa-shopping-cart', label: 'Procurement', desc: 'Purchase orders', route: '/app/purchase/requisition', gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', color: '#fbc2eb' },
    { icon: 'fas fa-calculator', label: 'Accounting', desc: 'Finance & accounts', route: '/app/accounting/dashboard', gradient: 'linear-gradient(135deg, #fddb92, #d1fdff)', color: '#fddb92' },
    { icon: 'fas fa-umbrella-beach', label: 'Leave', desc: 'Leave management', route: '/app/leave/requests', gradient: 'linear-gradient(135deg, #c1dfc4, #deecdd)', color: '#c1dfc4' }
  ];

  constructor(
    private dashboardService: DashboardService,
    private itemService: ItemService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.initCalendar();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.firstName) return user.firstName;
      return user.username;
    }
    return 'User';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  initCalendar(): void {
    const date = new Date();
    this.year = date.getFullYear();
    const month = date.getMonth();
    this.monthName = date.toLocaleString('default', { month: 'long' });

    const firstDay = new Date(this.year, month, 1).getDay();
    const totalDays = new Date(this.year, month + 1, 0).getDate();

    this.daysInMonth = [];
    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push(0);
    }
    for (let i = 1; i <= totalDays; i++) {
      this.daysInMonth.push(i);
    }

    this.loadCalendarEvents();
  }

  loadCalendarEvents(): void {
    this.events = [];
    const year = this.year;
    const month = this.currentDate.getMonth();

    this.http.get<any[]>('/api/holidays').subscribe({
      next: (holidays) => {
        if (holidays && Array.isArray(holidays)) {
          holidays.forEach(h => {
            if (!h.date) return;
            const hDate = new Date(h.date);
            if (hDate.getMonth() === month && hDate.getFullYear() === year) {
              this.events.push({
                day: hDate.getDate(),
                title: h.name || 'Holiday',
                type: 'success'
              });
            }
          });
        }
      },
      error: () => {}
    });

    this.http.get<any[]>('/api/leave-requests').subscribe({
      next: (leaves) => {
        if (leaves && Array.isArray(leaves)) {
          const approvedLeaves = leaves.filter(l => l.status === 'APPROVED');
          const leaveDays: { [key: number]: number } = {};

          approvedLeaves.forEach(l => {
            if (!l.startDate || !l.endDate) return;
            const startD = new Date(l.startDate);
            const endD = new Date(l.endDate);
            for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
              if (d.getMonth() === month && d.getFullYear() === year) {
                leaveDays[d.getDate()] = (leaveDays[d.getDate()] || 0) + 1;
              }
            }
          });

          Object.keys(leaveDays).forEach(day => {
            const dayNum = parseInt(day);
            const count = leaveDays[dayNum];
            this.events.push({
              day: dayNum,
              title: count > 1 ? `${count} on Leave` : 'Employee Leave',
              type: 'info'
            });
          });
        }
      },
      error: () => {}
    });

    const payDay = 25;
    const lastDay = new Date(year, month + 1, 0).getDate();
    if (payDay <= lastDay) {
      this.events.push({
        day: payDay,
        title: 'Payroll Day',
        type: 'warning'
      });
    }
  }

  getEventsForDay(day: number): any[] {
    return this.events.filter(e => e.day === day);
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === this.currentDate.getMonth() && today.getFullYear() === this.currentDate.getFullYear();
  }

  private incrementAndCheck(): void {
    this.subscriptionCount++;
    if (this.subscriptionCount >= this.expectedSubscriptions) {
      this.loading = false;
      this.dataReady = true;
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dataReady = false;
    this.subscriptionCount = 0;

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.dashboardStats = data;
        this.stats = [
          { icon: 'fas fa-users', label: 'Total Customers', value: data.totalCustomers?.toString() || '0', change: '', type: 'primary', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
          { icon: 'fas fa-file-contract', label: 'Total Contracts', value: data.totalContracts?.toString() || '0', change: '', type: 'success', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
          { icon: 'fas fa-box', label: 'Total Items', value: data.totalItems?.toString() || '0', change: '', type: 'info', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
          { icon: 'fas fa-dollar-sign', label: 'Inventory Value', value: '$' + (data.totalInventoryValue?.toLocaleString() || '0'), change: '', type: 'warning', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' }
        ];
        this.incrementAndCheck();
      },
      error: (err) => {
        console.error('Error loading dashboard stats', err);
        this.stats = [
          { icon: 'fas fa-users', label: 'Total Customers', value: '0', change: '', type: 'primary', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
          { icon: 'fas fa-file-contract', label: 'Total Contracts', value: '0', change: '', type: 'success', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
          { icon: 'fas fa-box', label: 'Total Items', value: '0', change: '', type: 'info', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
          { icon: 'fas fa-dollar-sign', label: 'Inventory Value', value: '$0', change: '', type: 'warning', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' }
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
