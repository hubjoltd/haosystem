import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private baseUrl = '/api/recruitment';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getRequisitions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/requisitions`);
  }

  getRequisition(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requisitions/${id}`);
  }

  createRequisition(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requisitions`, data);
  }

  updateRequisition(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/requisitions/${id}`, data);
  }

  submitRequisition(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requisitions/${id}/submit`, {});
  }

  approveRequisition(id: number, approverId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requisitions/${id}/approve`, { approverId });
  }

  rejectRequisition(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requisitions/${id}/reject`, { reason });
  }

  holdRequisition(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requisitions/${id}/hold`, {});
  }

  deleteRequisition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/requisitions/${id}`);
  }

  getOffers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/offers`);
  }

  getOffer(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/offers/${id}`);
  }

  createOffer(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/offers`, data);
  }

  updateOffer(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/offers/${id}`, data);
  }

  sendOffer(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/offers/${id}/send`, {});
  }

  acceptOffer(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/offers/${id}/accept`, {});
  }

  declineOffer(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/offers/${id}/decline`, { reason });
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/offers/${id}`);
  }

  getJobPostings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/job-postings`);
  }

  getActiveJobPostings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/job-postings/active`);
  }

  getJobPosting(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/job-postings/${id}`);
  }

  createJobPosting(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/job-postings`, data);
  }

  updateJobPosting(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/job-postings/${id}`, data);
  }

  publishJobPosting(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/job-postings/${id}/publish`, {});
  }

  closeJobPosting(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/job-postings/${id}/close`, {});
  }

  deleteJobPosting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/job-postings/${id}`);
  }

  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates`);
  }

  getCandidatesByPosting(postingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates/posting/${postingId}`);
  }

  getCandidate(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/candidates/${id}`);
  }

  createCandidate(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/candidates`, data);
  }

  updateCandidate(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/candidates/${id}`, data);
  }

  updateCandidateStatus(id: number, status: string, notes: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/candidates/${id}/status`, { status, notes });
  }

  convertToEmployee(id: number, employeeData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/candidates/${id}/convert-to-employee`, employeeData);
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/candidates/${id}`);
  }

  getInterviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/interviews`);
  }

  getInterviewsByCandidate(candidateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/interviews/candidate/${candidateId}`);
  }

  getUpcomingInterviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/interviews/upcoming`);
  }

  scheduleInterview(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/interviews`, data);
  }

  updateInterview(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/interviews/${id}`, data);
  }

  submitFeedback(id: number, feedback: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/interviews/${id}/feedback`, feedback);
  }

  cancelInterview(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/interviews/${id}/cancel`, { reason });
  }
}
