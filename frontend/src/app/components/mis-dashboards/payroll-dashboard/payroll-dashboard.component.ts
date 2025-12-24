import { Component, OnInit } from '@angular/core';
import { MisDashboardService, PayrollDashboardStats } from '../../../services/mis-dashboard.service';

@Component({
  selector: 'app-payroll-dashboard',
  standalone: false,
  templateUrl: './payroll-dashboard.component.html',
  styleUrls: ['./payroll-dashboard.component.scss']
})
export class PayrollDashboardComponent implements OnInit {
  stats: PayrollDashboardStats | null = null;
  loading = false;
  selectedPeriod = 'month';

  constructor(private dashboardService: MisDashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = false;
    this.dashboardService.getPayrollStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payroll dashboard', err);
        this.stats = this.getMockStats();
        this.loading = false;
      }
    });
  }

  getMockStats(): PayrollDashboardStats {
    return {
      totalPayrollCost: 1250000,
      avgSalary: 75000,
      totalDeductions: 187500,
      totalOvertimePay: 45000,
      payrollTrend: [
        { month: 'Jul', cost: 1180000 },
        { month: 'Aug', cost: 1195000 },
        { month: 'Sep', cost: 1210000 },
        { month: 'Oct', cost: 1230000 },
        { month: 'Nov', cost: 1245000 },
        { month: 'Dec', cost: 1250000 }
      ],
      deductionsBreakdown: [
        { category: 'Federal Tax', amount: 75000 },
        { category: 'State Tax', amount: 37500 },
        { category: 'Social Security', amount: 35000 },
        { category: 'Medicare', amount: 18000 },
        { category: 'Health Insurance', amount: 15000 },
        { category: '401(k)', amount: 7000 }
      ],
      overtimeTrend: [
        { month: 'Jul', hours: 420, cost: 38000 },
        { month: 'Aug', hours: 380, cost: 35000 },
        { month: 'Sep', hours: 450, cost: 42000 },
        { month: 'Oct', hours: 520, cost: 48000 },
        { month: 'Nov', hours: 480, cost: 44000 },
        { month: 'Dec', hours: 490, cost: 45000 }
      ],
      departmentPayroll: [
        { department: 'Engineering', cost: 450000 },
        { department: 'Sales', cost: 280000 },
        { department: 'Marketing', cost: 150000 },
        { department: 'HR', cost: 120000 },
        { department: 'Finance', cost: 180000 },
        { department: 'Operations', cost: 70000 }
      ],
      salaryDistribution: [
        { range: '$30-50K', count: 25 },
        { range: '$50-75K', count: 48 },
        { range: '$75-100K', count: 42 },
        { range: '$100-150K', count: 28 },
        { range: '$150K+', count: 13 }
      ]
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  }

  getMaxPayrollCost(): number {
    if (!this.stats) return 0;
    return Math.max(...this.stats.payrollTrend.map(p => p.cost));
  }

  getMaxDeduction(): number {
    if (!this.stats) return 0;
    return Math.max(...this.stats.deductionsBreakdown.map(d => d.amount));
  }

  getMaxDeptPayroll(): number {
    if (!this.stats) return 0;
    return Math.max(...this.stats.departmentPayroll.map(d => d.cost));
  }
}
