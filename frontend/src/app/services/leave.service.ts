import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveType {
  id?: number;
  code: string;
  name: string;
  description?: string;
  annualEntitlement?: number;
  accrualType?: string;
  accrualRate?: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  encashmentAllowed?: boolean;
  encashmentRate?: number;
  requiresApproval?: boolean;
  minNoticeDays?: number;
  maxConsecutiveDays?: number;
  isPaid?: boolean;
  isActive?: boolean;
  documentRequired?: boolean;
  applicableGender?: string;
  colorCode?: string;
}

export interface LeaveRequest {
  id?: number;
  employeeId?: number;
  employee?: any;
  leaveTypeId?: number;
  leaveType?: any;
  startDate: string;
  endDate: string;
  totalDays?: number;
  dayType?: string;
  reason?: string;
  status?: string;
  approvedBy?: any;
  approvedAt?: string;
  approverRemarks?: string;
  attachmentUrl?: string;
  emergencyContact?: string;
}

export interface LeaveBalance {
  id?: number;
  employeeId?: number;
  employee?: any;
  leaveTypeId?: number;
  leaveType?: any;
  year: number;
  openingBalance?: number;
  credited?: number;
  used?: number;
  pending?: number;
  lapsed?: number;
  carryForward?: number;
  encashed?: number;
  availableBalance?: number;
}

export interface Holiday {
  id?: number;
  name: string;
  holidayDate: string;
  description?: string;
  holidayType?: string;
  isPaid?: boolean;
  isOptional?: boolean;
  year?: number;
  dayOfWeek?: string;
  isActive?: boolean;
  applicableLocations?: string;
  applicableDepartments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private baseUrl = '/api/leave';

  constructor(private http: HttpClient) {}

  getAllLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.baseUrl}/types`);
  }

  getActiveLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.baseUrl}/types/active`);
  }

  getLeaveTypeById(id: number): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${this.baseUrl}/types/${id}`);
  }

  createLeaveType(leaveType: LeaveType): Observable<LeaveType> {
    return this.http.post<LeaveType>(`${this.baseUrl}/types`, leaveType);
  }

  updateLeaveType(id: number, leaveType: LeaveType): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.baseUrl}/types/${id}`, leaveType);
  }

  deleteLeaveType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/types/${id}`);
  }

  getAllRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/requests`);
  }

  getPendingRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/requests/pending`);
  }

  getRequestById(id: number): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(`${this.baseUrl}/requests/${id}`);
  }

  getRequestsByEmployee(employeeId: number): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/requests/employee/${employeeId}`);
  }

  createRequest(request: any): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.baseUrl}/requests`, request);
  }

  approveRequest(id: number, approverId?: number, remarks?: string): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.baseUrl}/requests/${id}/approve`, { approverId, approverRemarks: remarks });
  }

  rejectRequest(id: number, approverId?: number, remarks?: string): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.baseUrl}/requests/${id}/reject`, { approverId, approverRemarks: remarks });
  }

  cancelRequest(id: number): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.baseUrl}/requests/${id}/cancel`, {});
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/requests/${id}`);
  }

  getEmployeeBalances(employeeId: number): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.baseUrl}/balances/employee/${employeeId}`);
  }

  getEmployeeBalancesByYear(employeeId: number, year: number): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.baseUrl}/balances/employee/${employeeId}/year/${year}`);
  }

  initializeBalances(employeeId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/balances/initialize/${employeeId}`, {});
  }

  updateBalance(id: number, balance: LeaveBalance): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.baseUrl}/balances/${id}`, balance);
  }

  getAllHolidays(): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(`${this.baseUrl}/holidays`);
  }

  getHolidaysByYear(year: number): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(`${this.baseUrl}/holidays/year/${year}`);
  }

  getHolidayById(id: number): Observable<Holiday> {
    return this.http.get<Holiday>(`${this.baseUrl}/holidays/${id}`);
  }

  createHoliday(holiday: Holiday): Observable<Holiday> {
    return this.http.post<Holiday>(`${this.baseUrl}/holidays`, holiday);
  }

  updateHoliday(id: number, holiday: Holiday): Observable<Holiday> {
    return this.http.put<Holiday>(`${this.baseUrl}/holidays/${id}`, holiday);
  }

  deleteHoliday(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/holidays/${id}`);
  }

  getMonthlyCalendar(year: number, month: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/holidays/calendar/${year}/${month}`);
  }

  getEmployeeLeaveSummary(employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/summary/employee/${employeeId}`);
  }
}
