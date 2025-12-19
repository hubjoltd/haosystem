import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private baseUrl = '/api/onboarding';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/plans`);
  }

  getActivePlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/plans/active`);
  }

  getPlan(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/plans/${id}`);
  }

  getPlanByEmployee(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/plans/employee/${employeeId}`);
  }

  createPlan(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/plans`, data);
  }

  updatePlan(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/plans/${id}`, data);
  }

  startPlan(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/plans/${id}/start`, {});
  }

  completePlan(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/plans/${id}/complete`, {});
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/plans/${id}`);
  }

  getTasksByPlan(planId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks/plan/${planId}`);
  }

  getPendingTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks/pending`);
  }

  getOverdueTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks/overdue`);
  }

  getTask(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tasks/${id}`);
  }

  createTask(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks`, data);
  }

  updateTask(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tasks/${id}`, data);
  }

  startTask(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks/${id}/start`, {});
  }

  completeTask(id: number, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks/${id}/complete`, { notes });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }

  getAssetsByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assets/employee/${employeeId}`);
  }

  getPendingReturns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assets/pending-returns`);
  }

  assignAsset(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/assets`, data);
  }

  returnAsset(id: number, returnNotes?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/assets/${id}/return`, { returnNotes });
  }
}
