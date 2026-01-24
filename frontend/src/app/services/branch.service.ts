import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from './auth.service';

export type { Branch } from './auth.service';

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

  getBranchBySlug(slug: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.baseUrl}/by-slug/${slug}`);
  }

  getMyBranch(): Observable<Branch> {
    return this.http.get<Branch>(`${this.baseUrl}/my-branch`);
  }

  createBranch(branch: Partial<Branch> & { 
    adminUsername?: string; 
    adminPassword?: string; 
    adminEmail?: string;
    adminFirstName?: string;
    adminLastName?: string;
  }): Observable<any> {
    return this.http.post<any>(this.baseUrl, branch);
  }

  uploadLogo(branchId: number, file: File): Observable<{ logoPath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ logoPath: string }>(`${this.baseUrl}/${branchId}/logo`, formData);
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

  getBranchSettings(branchId: number): Observable<BranchSettings> {
    return this.http.get<BranchSettings>(`${this.baseUrl}/${branchId}/settings`);
  }

  updateBranchSettings(branchId: number, settings: Partial<BranchSettings>): Observable<BranchSettings> {
    return this.http.put<BranchSettings>(`${this.baseUrl}/${branchId}/settings`, settings);
  }

  uploadBranchLogo(branchId: number, file: File): Observable<{ message: string; logoPath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; logoPath: string }>(`${this.baseUrl}/${branchId}/settings/logo`, formData);
  }

  uploadBranchSignature(branchId: number, file: File): Observable<{ message: string; signaturePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; signaturePath: string }>(`${this.baseUrl}/${branchId}/settings/signature`, formData);
  }
}

export interface BranchSettings {
  id?: number;
  branch?: Branch;
  companyLegalName?: string;
  displayName?: string;
  taxRegistrationNumber?: string;
  businessRegistrationNumber?: string;
  fiscalYearStartMonth?: number;
  timeFormat?: string;
  numberFormat?: string;
  currencySymbol?: string;
  currencyPosition?: string;
  defaultTaxRate?: number;
  taxLabel?: string;
  invoicePrefix?: string;
  invoiceNextNumber?: number;
  purchaseOrderPrefix?: string;
  purchaseOrderNextNumber?: number;
  quotationPrefix?: string;
  quotationNextNumber?: number;
  receiptPrefix?: string;
  receiptNextNumber?: number;
  payrollPrefix?: string;
  payrollNextNumber?: number;
  defaultPaymentTerms?: string;
  invoiceDueDays?: number;
  invoiceFooter?: string;
  invoiceTerms?: string;
  letterhead?: string;
  signaturePath?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showLogoOnInvoices?: boolean;
  showLogoOnReports?: boolean;
  autoGenerateEmployeeId?: boolean;
  employeeIdPrefix?: string;
  employeeIdNextNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}
