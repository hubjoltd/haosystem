import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private baseUrl = '/api/loans';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getLoan(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getLoansByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  getActiveLoansForEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employee/${employeeId}/active`);
  }

  getEmployeeLoanSummary(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/employee/${employeeId}/summary`);
  }

  getLoansByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/status/${status}`);
  }

  getPendingApproval(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending-approval`);
  }

  getOutstandingLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/outstanding`);
  }

  applyForLoan(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  updateLoan(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  submitLoan(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/submit`, {});
  }

  approveLoan(id: number, approverId: number, remarks?: string, approvedAmount?: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/approve`, { approverId, remarks, approvedAmount });
  }

  rejectLoan(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  disburseLoan(id: number, disbursementDate: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/disburse`, { disbursementDate });
  }

  deleteLoan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getRepaymentsByLoan(loanId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${loanId}/repayments`);
  }

  getDueRepayments(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/repayments/due?date=${date}`);
  }

  getOverdueRepayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/repayments/overdue`);
  }

  recordPayment(repaymentId: number, paidAmount: number, paymentDate: string, paymentReference?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/repayments/${repaymentId}/pay`, { paidAmount, paymentDate, paymentReference });
  }

  recordPayrollDeduction(repaymentId: number, payrollRecordId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/repayments/${repaymentId}/payroll-deduction`, { payrollRecordId });
  }
}
