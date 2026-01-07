import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee.service';

export interface DocumentCategory {
  id?: number;
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentType {
  id?: number;
  category?: DocumentCategory;
  code: string;
  name: string;
  description?: string;
  isMandatory: boolean;
  hasExpiry: boolean;
  defaultReminderDays?: number;
  sortOrder?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeDocument {
  id?: number;
  employee?: Employee;
  documentType?: DocumentType;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  verificationStatus: string;
  reminderDays?: number;
  reminderSent?: boolean;
  remarks?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationRemarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentStats {
  verified: number;
  pending: number;
  total: number;
}

export interface ChecklistDocumentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  isMandatory: boolean;
  hasExpiry: boolean;
  status: 'PENDING' | 'UPLOADED';
  documentId?: number;
  documentNumber?: string;
  issueDate?: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  verificationStatus?: string;
  uploadedAt?: string;
  expiryDate?: string;
  active?: boolean;
}

export interface ChecklistCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  documentTypes: ChecklistDocumentType[];
  totalDocuments: number;
  uploadedDocuments: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = '/api/documents';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<DocumentCategory[]> {
    return this.http.get<DocumentCategory[]>(`${this.baseUrl}/categories`);
  }

  getAllCategories(): Observable<DocumentCategory[]> {
    return this.http.get<DocumentCategory[]>(`${this.baseUrl}/categories/all`);
  }

  getCategoryById(id: number): Observable<DocumentCategory> {
    return this.http.get<DocumentCategory>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(category: DocumentCategory): Observable<DocumentCategory> {
    return this.http.post<DocumentCategory>(`${this.baseUrl}/categories`, category);
  }

  updateCategory(id: number, category: DocumentCategory): Observable<DocumentCategory> {
    return this.http.put<DocumentCategory>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  getTypes(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${this.baseUrl}/types`);
  }

  getAllTypes(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${this.baseUrl}/types/all`);
  }

  getTypesByCategory(categoryId: number): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${this.baseUrl}/types/by-category/${categoryId}`);
  }

  getMandatoryTypes(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${this.baseUrl}/types/mandatory`);
  }

  getTypeById(id: number): Observable<DocumentType> {
    return this.http.get<DocumentType>(`${this.baseUrl}/types/${id}`);
  }

  createType(type: DocumentType): Observable<DocumentType> {
    return this.http.post<DocumentType>(`${this.baseUrl}/types`, type);
  }

  updateType(id: number, type: DocumentType): Observable<DocumentType> {
    return this.http.put<DocumentType>(`${this.baseUrl}/types/${id}`, type);
  }

  deleteType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/types/${id}`);
  }

  getEmployeeDocuments(employeeId: number): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  getEmployeeDocumentsByCategory(employeeId: number, categoryId: number): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.baseUrl}/employee/${employeeId}/category/${categoryId}`);
  }

  getDocumentById(id: number): Observable<EmployeeDocument> {
    return this.http.get<EmployeeDocument>(`${this.baseUrl}/${id}`);
  }

  createDocument(employeeId: number, document: EmployeeDocument): Observable<EmployeeDocument> {
    return this.http.post<EmployeeDocument>(`${this.baseUrl}/employee/${employeeId}`, document);
  }

  updateDocument(id: number, document: EmployeeDocument): Observable<EmployeeDocument> {
    return this.http.put<EmployeeDocument>(`${this.baseUrl}/${id}`, document);
  }

  verifyDocument(id: number, status: string, remarks?: string): Observable<EmployeeDocument> {
    let params = new HttpParams().set('status', status);
    if (remarks) {
      params = params.set('remarks', remarks);
    }
    return this.http.put<EmployeeDocument>(`${this.baseUrl}/${id}/verify`, null, { params });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPendingVerification(): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.baseUrl}/pending-verification`);
  }

  getExpiringDocuments(days: number = 30): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.baseUrl}/expiring`, { params: { days: days.toString() } });
  }

  getExpiredDocuments(): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.baseUrl}/expired`);
  }

  getEmployeeDocumentStats(employeeId: number): Observable<DocumentStats> {
    return this.http.get<DocumentStats>(`${this.baseUrl}/employee/${employeeId}/stats`);
  }

  initCategories(): Observable<string> {
    return this.http.post(`${this.baseUrl}/init-categories`, null, { responseType: 'text' });
  }

  checkExpiry(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/check-expiry`, null);
  }

  resetReminder(id: number): Observable<EmployeeDocument> {
    return this.http.put<EmployeeDocument>(`${this.baseUrl}/${id}/reset-reminder`, null);
  }

  getDocumentChecklist(): Observable<ChecklistCategory[]> {
    return this.http.get<ChecklistCategory[]>(`${this.baseUrl}/checklist`);
  }

  getEmployeeDocumentChecklist(employeeId: number): Observable<ChecklistCategory[]> {
    return this.http.get<ChecklistCategory[]>(`${this.baseUrl}/employee/${employeeId}/checklist`);
  }
}
