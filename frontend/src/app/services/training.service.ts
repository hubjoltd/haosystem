import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private baseUrl = '/api/training';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/programs`);
  }

  getActivePrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/programs/active`);
  }

  getProgram(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/programs/${id}`);
  }

  createProgram(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/programs`, data);
  }

  updateProgram(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/programs/${id}`, data);
  }

  deleteProgram(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/programs/${id}`);
  }

  getSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sessions`);
  }

  getSessionsByProgram(programId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sessions/program/${programId}`);
  }

  getUpcomingSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sessions/upcoming`);
  }

  getSession(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sessions/${id}`);
  }

  createSession(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sessions`, data);
  }

  updateSession(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/sessions/${id}`, data);
  }

  startSession(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sessions/${id}/start`, {});
  }

  completeSession(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sessions/${id}/complete`, {});
  }

  cancelSession(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sessions/${id}/cancel`, { reason });
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  getEnrollmentsBySession(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/enrollments/session/${sessionId}`);
  }

  getEnrollmentsByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/enrollments/employee/${employeeId}`);
  }

  enrollEmployee(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enrollments`, data);
  }

  markAttendance(id: number, attended: boolean): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enrollments/${id}/attendance`, { attended });
  }

  submitFeedback(id: number, feedback: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enrollments/${id}/feedback`, feedback);
  }

  markCompleted(id: number, score: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enrollments/${id}/complete`, { score });
  }

  generateCertificate(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enrollments/${id}/certificate`, {});
  }

  cancelEnrollment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/enrollments/${id}`);
  }
}
