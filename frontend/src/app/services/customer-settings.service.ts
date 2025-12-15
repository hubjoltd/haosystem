import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CustomerGroup {
  id?: number;
  name: string;
  description: string;
  discount: number;
}

export interface CustomerStatus {
  id?: number;
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerSettingsService {
  private apiUrl = '/api/settings/customer';

  constructor(private http: HttpClient) {}

  // Customer Groups
  getGroups(): Observable<CustomerGroup[]> {
    return this.http.get<CustomerGroup[]>(`${this.apiUrl}/groups`);
  }

  getGroupById(id: number): Observable<CustomerGroup> {
    return this.http.get<CustomerGroup>(`${this.apiUrl}/groups/${id}`);
  }

  createGroup(group: CustomerGroup): Observable<CustomerGroup> {
    return this.http.post<CustomerGroup>(`${this.apiUrl}/groups`, group);
  }

  updateGroup(id: number, group: CustomerGroup): Observable<CustomerGroup> {
    return this.http.put<CustomerGroup>(`${this.apiUrl}/groups/${id}`, group);
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/groups/${id}`);
  }

  // Customer Statuses
  getStatuses(): Observable<CustomerStatus[]> {
    return this.http.get<CustomerStatus[]>(`${this.apiUrl}/statuses`);
  }

  getStatusById(id: number): Observable<CustomerStatus> {
    return this.http.get<CustomerStatus>(`${this.apiUrl}/statuses/${id}`);
  }

  createStatus(status: CustomerStatus): Observable<CustomerStatus> {
    return this.http.post<CustomerStatus>(`${this.apiUrl}/statuses`, status);
  }

  updateStatus(id: number, status: CustomerStatus): Observable<CustomerStatus> {
    return this.http.put<CustomerStatus>(`${this.apiUrl}/statuses/${id}`, status);
  }

  deleteStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/statuses/${id}`);
  }
}
