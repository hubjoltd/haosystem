import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HRDashboardStats {
  totalHeadcount: number;
  activeEmployees: number;
  onLeave: number;
  newHiresThisMonth: number;
  exitsThisMonth: number;
  attritionRate: number;
  avgTenure: number;
  genderDiversity: { male: number; female: number; other: number };
  departmentDistribution: { department: string; count: number }[];
  monthlyHiringTrend: { month: string; hires: number; exits: number }[];
  ageDistribution: { range: string; count: number }[];
  employmentTypeDistribution: { type: string; count: number }[];
}

export interface PayrollDashboardStats {
  totalPayrollCost: number;
  avgSalary: number;
  totalDeductions: number;
  totalOvertimePay: number;
  payrollTrend: { month: string; cost: number }[];
  deductionsBreakdown: { category: string; amount: number }[];
  overtimeTrend: { month: string; hours: number; cost: number }[];
  departmentPayroll: { department: string; cost: number }[];
  salaryDistribution: { range: string; count: number }[];
}

export interface AttendanceDashboardStats {
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  lateArrivals: number;
  avgAttendanceRate: number;
  totalOvertimeHours: number;
  attendanceTrend: { date: string; present: number; absent: number; leave: number }[];
  leaveTypeDistribution: { type: string; count: number }[];
  departmentAttendance: { department: string; rate: number }[];
  overtimeSummary: { department: string; hours: number }[];
}

export interface PerformanceDashboardStats {
  highPerformers: number;
  avgPerformanceScore: number;
  pendingAppraisals: number;
  completedAppraisals: number;
  topPerformers: { name: string; department: string; score: number; designation: string }[];
  performanceDistribution: { rating: string; count: number }[];
  appraisalTrend: { quarter: string; avgScore: number }[];
  departmentPerformance: { department: string; avgScore: number }[];
  performanceByGrade: { grade: string; avgScore: number }[];
}

export interface ReportField {
  id: string;
  name: string;
  category: string;
  dataType: string;
}

export interface ReportTemplate {
  id?: number;
  name: string;
  description: string;
  selectedFields: string[];
  filters: any;
  sortBy: string;
  sortOrder: string;
  createdAt?: string;
  createdBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MisDashboardService {
  private baseUrl = '/api/mis-dashboard';

  constructor(private http: HttpClient) {}

  getHRStats(): Observable<HRDashboardStats> {
    return this.http.get<HRDashboardStats>(`${this.baseUrl}/hr`);
  }

  getPayrollStats(): Observable<PayrollDashboardStats> {
    return this.http.get<PayrollDashboardStats>(`${this.baseUrl}/payroll`);
  }

  getAttendanceStats(): Observable<AttendanceDashboardStats> {
    return this.http.get<AttendanceDashboardStats>(`${this.baseUrl}/attendance`);
  }

  getPerformanceStats(): Observable<PerformanceDashboardStats> {
    return this.http.get<PerformanceDashboardStats>(`${this.baseUrl}/performance`);
  }

  getReportFields(): Observable<ReportField[]> {
    return this.http.get<ReportField[]>(`${this.baseUrl}/report-fields`);
  }

  getReportTemplates(): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.baseUrl}/report-templates`);
  }

  saveReportTemplate(template: ReportTemplate): Observable<ReportTemplate> {
    if (template.id) {
      return this.http.put<ReportTemplate>(`${this.baseUrl}/report-templates/${template.id}`, template);
    }
    return this.http.post<ReportTemplate>(`${this.baseUrl}/report-templates`, template);
  }

  deleteReportTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/report-templates/${id}`);
  }

  generateReport(templateId: number, format: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/generate-report/${templateId}`, {
      params: { format },
      responseType: 'blob'
    });
  }

  exportDashboard(dashboardType: string, format: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/${dashboardType}`, {
      params: { format },
      responseType: 'blob'
    });
  }
}
