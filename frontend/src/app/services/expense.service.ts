import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseCategory, ExpenseRequest, ExpenseItem, ExpenseActivity } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = '/api/expenses';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.apiUrl}/categories`);
  }

  getCategories(): Observable<ExpenseCategory[]> {
    return this.getAllCategories();
  }

  getActiveCategories(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.apiUrl}/categories/active`);
  }

  getCategoryById(id: number): Observable<ExpenseCategory> {
    return this.http.get<ExpenseCategory>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: Partial<ExpenseCategory>): Observable<ExpenseCategory> {
    return this.http.post<ExpenseCategory>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: Partial<ExpenseCategory>): Observable<ExpenseCategory> {
    return this.http.put<ExpenseCategory>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  initializeDefaultCategories(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories/init`, {});
  }

  getAllRequests(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(this.apiUrl);
  }

  getRequestById(id: number): Observable<ExpenseRequest> {
    return this.http.get<ExpenseRequest>(`${this.apiUrl}/${id}`);
  }

  getRequestsByEmployee(employeeId: number): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getRequestsByStatus(status: string): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.apiUrl}/status/${status}`);
  }

  getPendingApprovals(approverId: number): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.apiUrl}/pending-approvals/${approverId}`);
  }

  getPendingReimbursements(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.apiUrl}/pending-reimbursements`);
  }

  getApprovedNotPosted(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.apiUrl}/approved-not-posted`);
  }

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getExpensesByCategory(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.apiUrl}/by-category`;
    const params: string[] = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any>(url);
  }

  createRequest(request: Partial<ExpenseRequest>): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(this.apiUrl, request);
  }

  updateRequest(id: number, request: Partial<ExpenseRequest>): Observable<ExpenseRequest> {
    return this.http.put<ExpenseRequest>(`${this.apiUrl}/${id}`, request);
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addItem(requestId: number, item: Partial<ExpenseItem>): Observable<ExpenseItem> {
    return this.http.post<ExpenseItem>(`${this.apiUrl}/${requestId}/items`, item);
  }

  removeItem(requestId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${requestId}/items/${itemId}`);
  }

  submitRequest(id: number, submittedBy?: string): Observable<ExpenseRequest> {
    let url = `${this.apiUrl}/${id}/submit`;
    if (submittedBy) url += `?submittedBy=${submittedBy}`;
    return this.http.post<ExpenseRequest>(url, {});
  }

  approveRequest(id: number, approvalData: any): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/approve`, approvalData);
  }

  rejectRequest(id: number, reason: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  returnRequest(id: number, reason: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/return`, { reason });
  }

  markReimbursed(id: number, payrollRecordId?: number): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/reimburse`, { payrollRecordId });
  }

  postToAccounts(id: number, accountingReference: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/post-to-accounts`, { accountingReference });
  }

  // 2-level approval methods
  managerApprove(id: number, remarks?: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/manager-approve`, { remarks });
  }

  managerReject(id: number, remarks?: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/manager-reject`, { remarks });
  }

  hrApprove(id: number, remarks?: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/hr-approve`, { remarks });
  }

  hrReject(id: number, remarks?: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.apiUrl}/${id}/hr-reject`, { remarks });
  }

  getPendingManagerApprovals(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.apiUrl}/pending-manager`);
  }

  getPendingHrApprovals(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.apiUrl}/pending-hr`);
  }

  getRequestActivity(id: number): Observable<ExpenseActivity[]> {
    return this.http.get<ExpenseActivity[]>(`${this.apiUrl}/${id}/activity`);
  }

  addActivityNote(id: number, note: string): Observable<ExpenseActivity> {
    return this.http.post<ExpenseActivity>(`${this.apiUrl}/${id}/activity`, { note });
  }
}
