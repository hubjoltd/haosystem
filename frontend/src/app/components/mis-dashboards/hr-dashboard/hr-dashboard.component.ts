import { Component, OnInit } from '@angular/core';
import { MisDashboardService, HRDashboardStats } from '../../../services/mis-dashboard.service';

@Component({
  selector: 'app-hr-dashboard',
  standalone: false,
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HRDashboardComponent implements OnInit {
  stats: HRDashboardStats | null = null;
  loading = true;
  error = '';
  selectedPeriod = 'month';

  constructor(private dashboardService: MisDashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getHRStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading HR dashboard', err);
        this.stats = this.getMockStats();
        this.loading = false;
      }
    });
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
