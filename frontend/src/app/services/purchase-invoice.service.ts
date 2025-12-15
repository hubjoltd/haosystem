import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PurchaseInvoiceItem {
  id?: number;
  itemCode: string;
  itemName: string;
  description: string;
  hsnCode: string;
  quantity: number;
  uom: string;
  rate: number;
  taxRate: number;
  taxAmount: number;
  amount: number;
  remarks: string;
}

export interface PurchaseInvoice {
  id?: number;
  invoiceNumber?: string;
  poId?: number;
  poNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  supplierId?: number;
  supplierName?: string;
  supplierAddress?: string;
  supplierGstin?: string;
  supplierContact?: string;
  supplierEmail?: string;
  billToName?: string;
  billToAddress?: string;
  billToGstin?: string;
  shipToName?: string;
  shipToAddress?: string;
  paymentTerms?: string;
  subtotal?: number;
  taxAmount?: number;
  discount?: number;
  totalAmount?: number;
  status: string;
  remarks?: string;
  createdAt?: string;
  createdBy?: string;
  items: PurchaseInvoiceItem[];
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseInvoiceService {
  private baseUrl = '/api/purchase/invoices';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseInvoice[]> {
    return this.http.get<PurchaseInvoice[]>(this.baseUrl);
  }

  getById(id: number): Observable<PurchaseInvoice> {
    return this.http.get<PurchaseInvoice>(`${this.baseUrl}/${id}`);
  }

  getByStatus(status: string): Observable<PurchaseInvoice[]> {
    return this.http.get<PurchaseInvoice[]>(`${this.baseUrl}/status/${status}`);
  }

  getByPoId(poId: number): Observable<PurchaseInvoice[]> {
    return this.http.get<PurchaseInvoice[]>(`${this.baseUrl}/po/${poId}`);
  }

  create(invoice: PurchaseInvoice): Observable<PurchaseInvoice> {
    return this.http.post<PurchaseInvoice>(this.baseUrl, invoice);
  }

  update(id: number, invoice: PurchaseInvoice): Observable<PurchaseInvoice> {
    return this.http.put<PurchaseInvoice>(`${this.baseUrl}/${id}`, invoice);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<PurchaseInvoice> {
    return this.http.post<PurchaseInvoice>(`${this.baseUrl}/${id}/status`, { status });
  }

  generateInvoiceNumber(): Observable<string> {
    return this.http.get(`${this.baseUrl}/generate-number`, { responseType: 'text' });
  }
}
