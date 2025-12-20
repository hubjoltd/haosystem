import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompensationService {
  private baseUrl = '/api/compensation';

  constructor(private http: HttpClient) {}

  getSalaryBands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/salary-bands`);
  }

  getSalaryBand(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/salary-bands/${id}`);
  }

  createSalaryBand(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/salary-bands`, data);
  }

  updateSalaryBand(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/salary-bands/${id}`, data);
  }

  deleteSalaryBand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/salary-bands/${id}`);
  }

  getSalaryRevisions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employee/salary/history/all`);
  }

  getSalaryRevisionsByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employee/${employeeId}/salary/history`);
  }

  createSalaryRevision(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employee/salary/revision`, data);
  }

  approveSalaryRevision(id: number, approverId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employee/salary/${id}/approve`, { approverId });
  }

  rejectSalaryRevision(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employee/salary/${id}/reject`, { reason });
  }

  getBonusIncentives(): Observable<any[]> {
    return this.http.get<any[]>('/api/salary-heads?type=BONUS');
  }

  createBonusIncentive(data: any): Observable<any> {
    return this.http.post<any>('/api/salary-heads', { ...data, headType: 'BONUS' });
  }

  updateBonusIncentive(id: number, data: any): Observable<any> {
    return this.http.put<any>(`/api/salary-heads/${id}`, data);
  }

  deleteBonusIncentive(id: number): Observable<void> {
    return this.http.delete<void>(`/api/salary-heads/${id}`);
  }

  getBenefitPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/benefit-plans`);
  }

  getBenefitPlan(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/benefit-plans/${id}`);
  }

  createBenefitPlan(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/benefit-plans`, data);
  }

  updateBenefitPlan(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/benefit-plans/${id}`, data);
  }

  deleteBenefitPlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/benefit-plans/${id}`);
  }

  getAllowances(): Observable<any[]> {
    return this.http.get<any[]>('/api/salary-heads?type=ALLOWANCE');
  }

  createAllowance(data: any): Observable<any> {
    return this.http.post<any>('/api/salary-heads', { ...data, headType: 'ALLOWANCE' });
  }

  updateAllowance(id: number, data: any): Observable<any> {
    return this.http.put<any>(`/api/salary-heads/${id}`, data);
  }

  deleteAllowance(id: number): Observable<void> {
    return this.http.delete<void>(`/api/salary-heads/${id}`);
  }

  getEmployeeBenefits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employee-benefits/all`);
  }

  getEmployeeBenefitsByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employee/${employeeId}/benefits`);
  }

  enrollEmployeeInBenefit(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employee/benefits/enroll`, data);
  }

  updateEmployeeBenefit(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/employee/benefits/${id}`, data);
  }

  cancelEmployeeBenefit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employee/benefits/${id}`);
  }

  getGrades(): Observable<any[]> {
    return this.http.get<any[]>('/api/organization/grades');
  }

  getJobRoles(): Observable<any[]> {
    return this.http.get<any[]>('/api/organization/job-roles');
  }
}
