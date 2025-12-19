import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HRLetter {
  id: number;
  letterNumber: string;
  employee: any;
  letterType: string;
  subject: string;
  content: string;
  issueDate: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  signed: boolean;
  signedAt: string;
  generatedAt: string;
  sentAt: string;
  sentToEmployee: boolean;
  notes: string;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class HRLetterService {
  private baseUrl = '/api/hr-letters';

  constructor(private http: HttpClient) {}

  getAllLetters(): Observable<HRLetter[]> {
    return this.http.get<HRLetter[]>(this.baseUrl);
  }

  getLetterById(id: number): Observable<HRLetter> {
    return this.http.get<HRLetter>(`${this.baseUrl}/${id}`);
  }

  getLettersByEmployee(employeeId: number): Observable<HRLetter[]> {
    return this.http.get<HRLetter[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  getLettersByType(type: string): Observable<HRLetter[]> {
    return this.http.get<HRLetter[]>(`${this.baseUrl}/type/${type}`);
  }

  getLettersByStatus(status: string): Observable<HRLetter[]> {
    return this.http.get<HRLetter[]>(`${this.baseUrl}/status/${status}`);
  }

  createLetter(data: any): Observable<HRLetter> {
    return this.http.post<HRLetter>(this.baseUrl, data);
  }

  updateLetter(id: number, data: any): Observable<HRLetter> {
    return this.http.put<HRLetter>(`${this.baseUrl}/${id}`, data);
  }

  generateLetter(id: number): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/${id}/generate`, {});
  }

  signLetter(id: number, signedBy: string, designation: string): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/${id}/sign`, { signedBy, designation });
  }

  issueLetter(id: number): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/${id}/issue`, {});
  }

  deleteLetter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  generateOfferLetter(employeeId: number, offerDetails: any): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/generate/offer/${employeeId}`, offerDetails);
  }

  generateAppointmentLetter(employeeId: number): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/generate/appointment/${employeeId}`, {});
  }

  generateExperienceLetter(employeeId: number, lastWorkingDate: string): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/generate/experience/${employeeId}`, { lastWorkingDate });
  }

  generateWarningLetter(employeeId: number, reason: string, warningLevel: string): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/generate/warning/${employeeId}`, { reason, warningLevel });
  }

  generateSalaryRevisionLetter(employeeId: number, revisionDetails: any): Observable<HRLetter> {
    return this.http.post<HRLetter>(`${this.baseUrl}/generate/salary-revision/${employeeId}`, revisionDetails);
  }
}
