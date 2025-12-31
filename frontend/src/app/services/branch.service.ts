import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from './auth.service';

export interface BranchUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: {
    id: number;
    name: string;
  };
  branch?: Branch;
  active: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface CreateBranchUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private baseUrl = '/api/branches';

  constructor(private http: HttpClient) {}

  getAllBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.baseUrl);
  }

  getActiveBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.baseUrl}/active`);
  }

  getBranchById(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.baseUrl}/${id}`);
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<Branch>(this.baseUrl, branch);
  }

  updateBranch(id: number, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<Branch>(`${this.baseUrl}/${id}`, branch);
  }

  deleteBranch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getBranchUsers(branchId: number): Observable<BranchUser[]> {
    return this.http.get<BranchUser[]>(`${this.baseUrl}/${branchId}/users`);
  }

  createBranchUser(branchId: number, user: CreateBranchUserRequest): Observable<BranchUser> {
    return this.http.post<BranchUser>(`${this.baseUrl}/${branchId}/users`, user);
  }

  updateBranchUser(branchId: number, userId: number, user: Partial<BranchUser>): Observable<BranchUser> {
    return this.http.put<BranchUser>(`${this.baseUrl}/${branchId}/users/${userId}`, user);
  }

  deleteBranchUser(branchId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${branchId}/users/${userId}`);
  }

  resetBranchUserPassword(branchId: number, userId: number, password: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${branchId}/users/${userId}/password`, { password });
  }
}
