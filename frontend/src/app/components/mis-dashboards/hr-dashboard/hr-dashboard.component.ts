import { Component, OnInit, OnDestroy } from '@angular/core';
import { MisDashboardService, HRDashboardStats } from '../../../services/mis-dashboard.service';

@Component({
  selector: 'app-hr-dashboard',
  standalone: false,
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HRDashboardComponent implements OnInit, OnDestroy {
  stats: HRDashboardStats | null = null;
  loading = false;
  error = '';
  selectedPeriod = 'month';
  refreshInterval: any;
  isRefreshing = false;
  dataLoaded = false;

  animatedStats = {
    totalHeadcount: 0,
    activeEmployees: 0,
    newHiresThisMonth: 0,
    exitsThisMonth: 0,
    attritionRate: 0,
    avgTenure: 0,
    onLeave: 0
  };

  recentActivities: any[] = [];

  constructor(private dashboardService: MisDashboardService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivities();
    this.refreshInterval = setInterval(() => {
      this.loadStats();
      this.loadRecentActivities();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadStats(): void {
    if (!this.stats) {
      this.loading = true;
    }
    this.isRefreshing = true;
    this.dashboardService.getHRStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.isRefreshing = false;
        this.triggerAnimations();
      },
      error: (err) => {
        console.error('Error loading HR dashboard', err);
        this.stats = this.getMockStats();
        this.loading = false;
        this.isRefreshing = false;
        this.triggerAnimations();
      }
    });
  }

  loadRecentActivities(): void {
    this.dashboardService.getHRRecentActivities().subscribe({
      next: (activities) => {
        if (activities && activities.length > 0) {
          this.recentActivities = activities;
        }
      },
      error: (err) => {
        console.error('Error loading recent activities', err);
      }
    });
  }

  triggerAnimations(): void {
    if (!this.stats) return;
    this.dataLoaded = false;
    setTimeout(() => {
      this.dataLoaded = true;
    }, 50);
    this.animateValue(0, this.stats.totalHeadcount, 1200, (v: number) => this.animatedStats.totalHeadcount = v);
    this.animateValue(0, this.stats.activeEmployees, 1200, (v: number) => this.animatedStats.activeEmployees = v);
    this.animateValue(0, this.stats.newHiresThisMonth, 800, (v: number) => this.animatedStats.newHiresThisMonth = v);
    this.animateValue(0, this.stats.exitsThisMonth, 800, (v: number) => this.animatedStats.exitsThisMonth = v);
    this.animateValue(0, this.stats.attritionRate * 10, 1000, (v: number) => this.animatedStats.attritionRate = v / 10);
    this.animateValue(0, this.stats.avgTenure * 10, 1000, (v: number) => this.animatedStats.avgTenure = v / 10);
    this.animateValue(0, this.stats.onLeave, 800, (v: number) => this.animatedStats.onLeave = v);
  }

  animateValue(start: number, end: number, duration: number, callback: (value: number) => void): void {
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      callback(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  getAttritionRingOffset(): number {
    if (!this.stats) return 0;
    const circumference = 2 * Math.PI * 54;
    return circumference - (this.stats.attritionRate / 100) * circumference;
  }

  getAttritionCircumference(): number {
    return 2 * Math.PI * 54;
  }

  getMockStats(): HRDashboardStats {
    return {
      totalHeadcount: 156,
      activeEmployees: 148,
      onLeave: 8,
      newHiresThisMonth: 12,
      exitsThisMonth: 3,
      attritionRate: 4.2,
      avgTenure: 3.5,
      genderDiversity: { male: 92, female: 58, other: 6 },
      departmentDistribution: [
        { department: 'Engineering', count: 45 },
        { department: 'Sales', count: 32 },
        { department: 'Marketing', count: 18 },
        { department: 'HR', count: 12 },
        { department: 'Finance', count: 24 },
        { department: 'Operations', count: 25 }
      ],
      monthlyHiringTrend: [
        { month: 'Jul', hires: 8, exits: 2 },
        { month: 'Aug', hires: 10, exits: 4 },
        { month: 'Sep', hires: 6, exits: 1 },
        { month: 'Oct', hires: 14, exits: 3 },
        { month: 'Nov', hires: 9, exits: 2 },
        { month: 'Dec', hires: 12, exits: 3 }
      ],
      ageDistribution: [
        { range: '18-25', count: 28 },
        { range: '26-35', count: 62 },
        { range: '36-45', count: 38 },
        { range: '46-55', count: 20 },
        { range: '55+', count: 8 }
      ],
      employmentTypeDistribution: [
        { type: 'Full-Time', count: 120 },
        { type: 'Part-Time', count: 15 },
        { type: 'Contract', count: 12 },
        { type: 'Intern', count: 9 }
      ]
    };
  }

  getGenderPercentage(gender: string): number {
    if (!this.stats) return 0;
    const total = this.stats.genderDiversity.male + this.stats.genderDiversity.female + this.stats.genderDiversity.other;
    const value = gender === 'male' ? this.stats.genderDiversity.male :
                  gender === 'female' ? this.stats.genderDiversity.female : this.stats.genderDiversity.other;
    return Math.round((value / total) * 100);
  }

  getMaxDepartmentCount(): number {
    if (!this.stats) return 0;
    return Math.max(...this.stats.departmentDistribution.map(d => d.count));
  }

  getMaxHires(): number {
    if (!this.stats) return 15;
    return Math.max(...this.stats.monthlyHiringTrend.map(d => Math.max(d.hires, d.exits))) + 2;
  }

  exportDashboard(format: string): void {
    this.dashboardService.exportDashboard('hr', format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hr-dashboard.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Export failed', err)
    });
  }
}
