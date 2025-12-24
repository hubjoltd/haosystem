import { Component, OnInit } from '@angular/core';
import { MisDashboardService, AttendanceDashboardStats } from '../../../services/mis-dashboard.service';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: false,
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.scss']
})
export class AttendanceDashboardComponent implements OnInit {
  stats: AttendanceDashboardStats | null = null;
  loading = false;
  selectedPeriod = 'week';

  constructor(private dashboardService: MisDashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = false;
    this.dashboardService.getAttendanceStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading attendance dashboard', err);
        this.stats = this.getMockStats();
        this.loading = false;
      }
    });
  }

  getMockStats(): AttendanceDashboardStats {
    return {
      presentToday: 138,
      absentToday: 6,
      onLeaveToday: 12,
      lateArrivals: 8,
      avgAttendanceRate: 94.2,
      totalOvertimeHours: 485,
      attendanceTrend: [
        { date: 'Mon', present: 142, absent: 4, leave: 10 },
        { date: 'Tue', present: 140, absent: 6, leave: 10 },
        { date: 'Wed', present: 145, absent: 3, leave: 8 },
        { date: 'Thu', present: 138, absent: 6, leave: 12 },
        { date: 'Fri', present: 135, absent: 8, leave: 13 }
      ],
      leaveTypeDistribution: [
        { type: 'Annual Leave', count: 45 },
        { type: 'Sick Leave', count: 28 },
        { type: 'Personal', count: 15 },
        { type: 'Maternity/Paternity', count: 5 },
        { type: 'Unpaid Leave', count: 3 }
      ],
      departmentAttendance: [
        { department: 'Engineering', rate: 96.5 },
        { department: 'Sales', rate: 92.3 },
        { department: 'Marketing', rate: 94.8 },
        { department: 'HR', rate: 98.2 },
        { department: 'Finance', rate: 95.4 },
        { department: 'Operations', rate: 91.7 }
      ],
      overtimeSummary: [
        { department: 'Engineering', hours: 180 },
        { department: 'Operations', hours: 120 },
        { department: 'Sales', hours: 85 },
        { department: 'Finance', hours: 55 },
        { department: 'Marketing', hours: 30 },
        { department: 'HR', hours: 15 }
      ]
    };
  }

  getMaxLeaveCount(): number {
    if (!this.stats) return 0;
    return Math.max(...this.stats.leaveTypeDistribution.map(l => l.count));
  }

  getMaxOTHours(): number {
    if (!this.stats) return 0;
    return Math.max(...this.stats.overtimeSummary.map(o => o.hours));
  }

  getTotalEmployees(): number {
    if (!this.stats) return 0;
    return this.stats.presentToday + this.stats.absentToday + this.stats.onLeaveToday;
  }
}
