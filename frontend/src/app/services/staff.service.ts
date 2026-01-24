import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Staff {
  id?: number;
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  roleId?: number;
  branchId?: number;
  branchName?: string;
  active?: boolean;
  lastLogin?: string;
  isAdmin?: boolean;
  isStaffMember?: boolean;
  hourlyRate?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = '/api/staff';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Staff[]> {
    return this.http.get<Staff[]>(this.apiUrl);
  }

  getById(id: number): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/${id}`);
  }

  create(staff: Staff): Observable<Staff> {
    return this.http.post<Staff>(this.apiUrl, staff);
  }

  update(id: number, staff: Staff): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/${id}`, staff);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  getRolesByBranch(branchId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/roles/branch/${branchId}`);
  }

  getByBranch(branchId: number): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/branch/${branchId}`);
  }
}
