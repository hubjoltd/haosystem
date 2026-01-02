import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ClientContact {
  id?: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  portalAccess: boolean;
  permissions: string[];
}

export interface ClientInvoice {
  id?: number;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: string;
}

export interface ClientPayment {
  id?: number;
  paymentDate: string;
  amount: number;
  method: string;
  reference: string;
}

export interface ClientProject {
  id?: number;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
}

export interface ClientTask {
  id?: number;
  projectId?: number;
  title: string;
  status: string;
  dueDate: string;
  assignee?: string;
}

export interface ClientTicket {
  id?: number;
  subject: string;
  status: string;
  priority: string;
  createdDate: string;
  lastUpdated: string;
}

export interface ClientNote {
  id?: number;
  content: string;
  createdBy: string;
  createdDate: string;
}

export interface ClientDocument {
  id?: number;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  fileUrl?: string;
}

export interface ClientContract {
  id?: number;
  contractNumber: string;
  title: string;
  startDate: string;
  expiryDate: string;
  value: number;
  status: string;
}

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  customerGroup: string;
  status: string;
  primaryContact?: string;
  currency?: string;
  language?: string;
  assignedStaff?: string;
  billingAddress?: string;
  defaultPaymentMethod?: string;
  outstandingBalance?: number;
  contacts?: ClientContact[];
  invoices?: ClientInvoice[];
  payments?: ClientPayment[];
  projects?: ClientProject[];
  tasks?: ClientTask[];
  tickets?: ClientTicket[];
  notes?: ClientNote[];
  documents?: ClientDocument[];
  contracts?: ClientContract[];
  createdDate?: string;
  lastActivityDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = '/api/customers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.baseUrl);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  create(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, customer);
  }

  update(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, customer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addContact(customerId: number, contact: ClientContact): Observable<ClientContact> {
    return this.http.post<ClientContact>(`${this.baseUrl}/${customerId}/contacts`, contact);
  }

  updateContact(customerId: number, contactId: number, contact: ClientContact): Observable<ClientContact> {
    return this.http.put<ClientContact>(`${this.baseUrl}/${customerId}/contacts/${contactId}`, contact);
  }

  deleteContact(customerId: number, contactId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${customerId}/contacts/${contactId}`);
  }

  addNote(customerId: number, note: ClientNote): Observable<ClientNote> {
    return this.http.post<ClientNote>(`${this.baseUrl}/${customerId}/notes`, note);
  }

  addDocument(customerId: number, document: ClientDocument): Observable<ClientDocument> {
    return this.http.post<ClientDocument>(`${this.baseUrl}/${customerId}/documents`, document);
  }
}
