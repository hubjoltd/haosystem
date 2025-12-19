import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {
  private baseUrl = '/api/settlements';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/status/${status}`);
  }

  getByEmployeeId(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/employee/${employeeId}`);
  }

  initiateSettlement(data: { employeeId: number; lastWorkingDay: string; separationType: string; createdBy?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  submit(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/submit`, {});
  }

  approve(id: number, approvedBy: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/approve`, { approvedBy });
  }

  reject(id: number, remarks: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/reject`, { remarks });
  }

  process(id: number, processedBy: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/process`, { processedBy });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
