import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MisDashboardService, AttendanceDashboardStats } from '../../../services/mis-dashboard.service';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { EmployeeService } from '../../../services/employee.service';
import { LeaveService } from '../../../services/leave.service';
import { OrganizationService } from '../../../services/organization.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: false,
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceDashboardComponent implements OnInit {
  stats: AttendanceDashboardStats | null = null;
  loading = false;
  selectedPeriod = 'week';

  constructor(
    private dashboardService: MisDashboardService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRealTimeStats();
  }

  loadStats(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.dashboardService.getAttendanceStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadRealTimeStats();
      }
    });
  }

  loadRealTimeStats(): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    const today = new Date().toISOString().split('T')[0];
    const weekStart = this.getWeekStart();
    const weekEnd = today;
    
    forkJoin({
      todayRecords: this.attendanceService.getByDate(today),
      weekRecords: this.attendanceService.getByDateRange(weekStart, weekEnd),
      employees: this.employeeService.getActive(),
      leaveRequests: this.leaveService.getAllRequests(),
      departments: this.orgService.getDepartments()
    }).subscribe({
      next: ({ todayRecords, weekRecords, employees, leaveRequests, departments }) => {
        const totalEmployees = employees.length;
        
        // Today's stats
        const presentToday = todayRecords.filter(r => 
          r.status === 'PRESENT' || r.status === 'HALF_DAY' || r.status === 'LATE'
        ).length;
        const lateArrivals = todayRecords.filter(r => r.status === 'LATE').length;
        
        // On leave today
        const onLeaveToday = leaveRequests.filter(r => {
          if (r.status !== 'APPROVED') return false;
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);
          const now = new Date(today);
          return now >= start && now <= end;
        }).length;
        
        const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);
        
        // Calculate average attendance rate for the week
        const weekDays = this.getWeekDays(weekStart, weekEnd);
        let totalPresent = 0;
        let totalPossible = 0;
        
        weekDays.forEach(day => {
          const dayRecords = weekRecords.filter(r => r.attendanceDate === day);
          totalPresent += dayRecords.filter(r => 
            r.status === 'PRESENT' || r.status === 'HALF_DAY' || r.status === 'LATE'
          ).length;
          totalPossible += totalEmployees;
        });
        
        const avgAttendanceRate = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;
        
        // Total overtime hours
        const totalOvertimeHours = weekRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
        
        // Attendance trend by day
        const attendanceTrend = this.calculateAttendanceTrend(weekRecords, leaveRequests, weekStart, weekEnd);
        
        // Leave type distribution
        const leaveTypeDistribution = this.calculateLeaveDistribution(leaveRequests);
        
        // Department attendance
        const departmentAttendance = this.calculateDepartmentAttendance(weekRecords, employees, departments);
        
        // Overtime by department
        const overtimeSummary = this.calculateOvertimeSummary(weekRecords, employees, departments);
        
        this.stats = {
          presentToday,
          absentToday,
          onLeaveToday,
          lateArrivals,
          avgAttendanceRate: Math.round(avgAttendanceRate * 10) / 10,
          totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
          attendanceTrend,
          leaveTypeDistribution,
          departmentAttendance,
          overtimeSummary
        };
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading real-time stats:', err);
        this.stats = this.getEmptyStats();
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getWeekStart(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  getWeekDays(start: string, end: string): string[] {
    const days: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  calculateAttendanceTrend(records: AttendanceRecord[], leaveRequests: any[], start: string, end: string): any[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = this.getWeekDays(start, end);
    
    return days.map(day => {
      const date = new Date(day);
      const dayRecords = records.filter(r => r.attendanceDate === day);
      const present = dayRecords.filter(r => 
        r.status === 'PRESENT' || r.status === 'HALF_DAY' || r.status === 'LATE'
      ).length;
      const absent = dayRecords.filter(r => r.status === 'ABSENT').length;
      const leave = leaveRequests.filter(r => {
        if (r.status !== 'APPROVED') return false;
        const s = new Date(r.startDate);
        const e = new Date(r.endDate);
        return date >= s && date <= e;
      }).length;
      
      return {
        date: dayNames[date.getDay()],
        present,
        absent,
        leave
      };
    });
  }

  calculateLeaveDistribution(leaveRequests: any[]): any[] {
    const typeMap = new Map<string, number>();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    leaveRequests
      .filter(r => {
        const d = new Date(r.startDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .forEach(r => {
        const typeName = r.leaveType?.name || 'Other';
        typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1);
      });
    
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  calculateDepartmentAttendance(records: AttendanceRecord[], employees: any[], departments: any[]): any[] {
    const deptMap = new Map<string, { present: number; total: number }>();
    
    departments.forEach(d => {
      deptMap.set(d.name, { present: 0, total: 0 });
    });
    
    employees.forEach(emp => {
      const deptName = emp.department?.name || 'Unassigned';
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, { present: 0, total: 0 });
      }
      const data = deptMap.get(deptName)!;
      data.total++;
      
      const empRecords = records.filter(r => 
        (r.employee?.id === emp.id || r.employeeId === emp.id) &&
        (r.status === 'PRESENT' || r.status === 'HALF_DAY' || r.status === 'LATE')
      );
      if (empRecords.length > 0) {
        data.present++;
      }
    });
    
    return Array.from(deptMap.entries())
      .map(([department, data]) => ({
        department,
        rate: data.total > 0 ? Math.round((data.present / data.total) * 1000) / 10 : 0
      }))
      .filter(d => d.rate > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 6);
  }

  calculateOvertimeSummary(records: AttendanceRecord[], employees: any[], departments: any[]): any[] {
    const deptMap = new Map<string, number>();
    
    records.forEach(r => {
      const emp = employees.find(e => e.id === r.employee?.id || e.id === r.employeeId);
      const deptName = emp?.department?.name || 'Unassigned';
      const ot = r.overtimeHours || 0;
      deptMap.set(deptName, (deptMap.get(deptName) || 0) + ot);
    });
    
    return Array.from(deptMap.entries())
      .map(([department, hours]) => ({ department, hours: Math.round(hours * 10) / 10 }))
      .filter(d => d.hours > 0)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 6);
  }

  getEmptyStats(): AttendanceDashboardStats {
    return {
      presentToday: 0,
      absentToday: 0,
      onLeaveToday: 0,
      lateArrivals: 0,
      avgAttendanceRate: 0,
      totalOvertimeHours: 0,
      attendanceTrend: [],
      leaveTypeDistribution: [],
      departmentAttendance: [],
      overtimeSummary: []
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
