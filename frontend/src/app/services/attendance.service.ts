import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendanceRecord {
  id?: number;
  employeeId?: number;
  employee?: any;
  attendanceDate: string;
  clockIn?: string;
  clockOut?: string;
  captureMethod?: string;
  status: string;
  regularHours?: number;
  overtimeHours?: number;
  breakDuration?: number;
  lateArrival?: boolean;
  lateMinutes?: number;
  earlyDeparture?: boolean;
  earlyMinutes?: number;
  remarks?: string;
  approvalStatus?: string;
  approvedBy?: any;
  approvedAt?: string;
  project?: { id?: number; name?: string };
  projectName?: string;
}

export interface AttendanceRule {
  id?: number;
  ruleName: string;
  description?: string;
  standardStartTime?: string;
  standardEndTime?: string;
  regularHoursPerDay?: number;
  weeklyHoursLimit?: number;
  graceMinutesIn?: number;
  graceMinutesOut?: number;
  breakDurationMinutes?: number;
  autoDeductBreak?: boolean;
  enableOvertime?: boolean;
  overtimeMultiplier?: number;
  maxOvertimeHoursDaily?: number;
  maxOvertimeHoursWeekly?: number;
  halfDayEnabled?: boolean;
  halfDayHours?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface ProjectTimeEntry {
  id?: number;
  employeeId?: number;
  employee?: any;
  projectCode: string;
  projectName: string;
  entryDate: string;
  entryType: string;
  hoursWorked?: number;
  isPresent?: boolean;
  taskDescription?: string;
  status?: string;
  remarks?: string;
  billable?: boolean;
  billableRate?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = '/api/attendance';

  constructor(private http: HttpClient) {}

  getAllRecords(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(this.baseUrl);
  }
  
  getEmployeesForClock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees-for-clock`);
  }

  getById(id: number): Observable<AttendanceRecord> {
    return this.http.get<AttendanceRecord>(`${this.baseUrl}/${id}`);
  }

  getByEmployee(employeeId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  getByDate(date: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/date/${date}`);
  }

  getByEmployeeAndDateRange(employeeId: number, startDate: string, endDate: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/employee/${employeeId}/range`, {
      params: { startDate, endDate }
    });
  }

  getByDateRange(startDate: string, endDate: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/date-range`, {
      params: { startDate, endDate }
    });
  }

  clockIn(employeeId: number, captureMethod: string = 'WEB'): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}/clock-in`, { employeeId, captureMethod });
  }

  clockOut(employeeId: number): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}/clock-out`, { employeeId });
  }

  manualEntry(record: AttendanceRecord): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}/manual-entry`, record);
  }

  bulkUpload(records: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk-upload`, records);
  }

  directEntry(employeeId: number, status: string, date?: string): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}/direct-entry`, { employeeId, status, date });
  }

  update(id: number, record: AttendanceRecord): Observable<AttendanceRecord> {
    return this.http.put<AttendanceRecord>(`${this.baseUrl}/${id}`, record);
  }

  approve(id: number, approverId?: number): Observable<AttendanceRecord> {
    return this.http.put<AttendanceRecord>(`${this.baseUrl}/${id}/approve`, { approverId });
  }

  bulkApprove(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/bulk-approve`, { ids });
  }

  reject(id: number, remarks?: string): Observable<AttendanceRecord> {
    return this.http.put<AttendanceRecord>(`${this.baseUrl}/${id}/reject`, { remarks });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTodaySummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/summary/today`);
  }

  getAllRules(): Observable<AttendanceRule[]> {
    return this.http.get<AttendanceRule[]>(`${this.baseUrl}/rules`);
  }

  getRuleById(id: number): Observable<AttendanceRule> {
    return this.http.get<AttendanceRule>(`${this.baseUrl}/rules/${id}`);
  }

  createRule(rule: AttendanceRule): Observable<AttendanceRule> {
    return this.http.post<AttendanceRule>(`${this.baseUrl}/rules`, rule);
  }

  updateRule(id: number, rule: AttendanceRule): Observable<AttendanceRule> {
    return this.http.put<AttendanceRule>(`${this.baseUrl}/rules/${id}`, rule);
  }

  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rules/${id}`);
  }

  getAllProjectTimeEntries(): Observable<ProjectTimeEntry[]> {
    return this.http.get<ProjectTimeEntry[]>(`${this.baseUrl}/project-time`);
  }

  getProjectTimeByEmployee(employeeId: number): Observable<ProjectTimeEntry[]> {
    return this.http.get<ProjectTimeEntry[]>(`${this.baseUrl}/project-time/employee/${employeeId}`);
  }

  getProjectTimeByProject(projectCode: string): Observable<ProjectTimeEntry[]> {
    return this.http.get<ProjectTimeEntry[]>(`${this.baseUrl}/project-time/project/${projectCode}`);
  }

  createProjectTimeEntry(entry: ProjectTimeEntry): Observable<ProjectTimeEntry> {
    return this.http.post<ProjectTimeEntry>(`${this.baseUrl}/project-time`, entry);
  }

  updateProjectTimeEntry(id: number, entry: ProjectTimeEntry): Observable<ProjectTimeEntry> {
    return this.http.put<ProjectTimeEntry>(`${this.baseUrl}/project-time/${id}`, entry);
  }

  approveProjectTime(id: number, approverId?: number): Observable<ProjectTimeEntry> {
    return this.http.put<ProjectTimeEntry>(`${this.baseUrl}/project-time/${id}/approve`, { approverId });
  }

  deleteProjectTimeEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/project-time/${id}`);
  }
}
