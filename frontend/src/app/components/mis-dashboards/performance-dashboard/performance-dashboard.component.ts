import { Component, OnInit } from '@angular/core';
import { MisDashboardService, PerformanceDashboardStats } from '../../../services/mis-dashboard.service';

@Component({
  selector: 'app-performance-dashboard',
  standalone: false,
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss']
})
export class PerformanceDashboardComponent implements OnInit {
  stats: PerformanceDashboardStats | null = null;
  loading = false;
  selectedPeriod = 'year';

  constructor(private dashboardService: MisDashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = false;
    this.dashboardService.getPerformanceStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading performance dashboard', err);
        this.stats = this.getMockStats();
        this.loading = false;
      }
    });
  }

  getMockStats(): PerformanceDashboardStats {
    return {
      highPerformers: 28,
      avgPerformanceScore: 3.8,
      pendingAppraisals: 15,
      completedAppraisals: 141,
      topPerformers: [
        { name: 'Sarah Johnson', department: 'Engineering', score: 4.9, designation: 'Senior Developer' },
        { name: 'Michael Chen', department: 'Sales', score: 4.8, designation: 'Sales Manager' },
        { name: 'Emily Davis', department: 'Marketing', score: 4.7, designation: 'Marketing Lead' },
        { name: 'James Wilson', department: 'Engineering', score: 4.6, designation: 'Tech Lead' },
        { name: 'Lisa Anderson', department: 'Finance', score: 4.5, designation: 'Finance Manager' }
      ],
      performanceDistribution: [
        { rating: 'Exceptional', count: 28 },
        { rating: 'Exceeds', count: 45 },
        { rating: 'Meets', count: 62 },
        { rating: 'Needs Improvement', count: 18 },
        { rating: 'Unsatisfactory', count: 3 }
      ],
      appraisalTrend: [
        { quarter: 'Q1 2024', avgScore: 3.6 },
        { quarter: 'Q2 2024', avgScore: 3.7 },
        { quarter: 'Q3 2024', avgScore: 3.7 },
        { quarter: 'Q4 2024', avgScore: 3.8 }
      ],
      departmentPerformance: [
        { department: 'Engineering', avgScore: 4.1 },
        { department: 'Finance', avgScore: 3.9 },
        { department: 'HR', avgScore: 3.8 },
        { department: 'Marketing', avgScore: 3.7 },
        { department: 'Sales', avgScore: 3.6 },
        { department: 'Operations', avgScore: 3.4 }
      ],
      performanceByGrade: [
        { grade: 'E1', avgScore: 3.4 },
        { grade: 'E2', avgScore: 3.6 },
        { grade: 'E3', avgScore: 3.8 },
        { grade: 'M1', avgScore: 4.0 },
        { grade: 'M2', avgScore: 4.2 },
        { grade: 'S1', avgScore: 4.3 }
      ]
    };
  }

  getScoreColor(score: number): string {
    if (score >= 4.5) return '#28a745';
    if (score >= 4.0) return '#5cb85c';
    if (score >= 3.5) return '#ffc107';
    if (score >= 3.0) return '#f0ad4e';
    return '#dc3545';
  }

  getRatingColor(rating: string): string {
    switch (rating) {
      case 'Exceptional': return '#28a745';
      case 'Exceeds': return '#5cb85c';
      case 'Meets': return '#17a2b8';
      case 'Needs Improvement': return '#ffc107';
      case 'Unsatisfactory': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getMaxRatingCount(): number {
    if (!this.stats) return 0;
    return Math.max(...this.stats.performanceDistribution.map(p => p.count));
  }
}
