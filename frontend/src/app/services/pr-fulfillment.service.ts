import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export type FulfillmentType = 'PO' | 'Stock Issue' | 'Material Transfer';

export interface FulfillmentItem {
  id?: number;
  prItemId: number;
  itemId?: number;
  itemCode?: string;
  itemName: string;
  itemDescription?: string;
  requestedQty: number;
  fulfilledQty: number;
  pendingQty: number;
  uom: string;
  selected?: boolean;
  fulfillQty?: number;
  rate?: number;
  amount?: number;
}

export interface PRFulfillment {
  id?: number;
  prId: number;
  prNumber: string;
  fulfillmentType: FulfillmentType;
  referenceNumber: string;
  fulfillmentDate: string;
  performedBy: string;
  performedById?: number;
  items: FulfillmentItem[];
  supplierId?: number;
  supplierName?: string;
  warehouseId?: number;
  warehouseName?: string;
  sourceLocation?: string;
  targetLocation?: string;
  paymentTerms?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  totalAmount?: number;
  createdAt?: string;
}

export interface FulfillmentHistory {
  id?: number;
  prId: number;
  prNumber: string;
  fulfillmentType: FulfillmentType;
  referenceNumber: string;
  quantity: number;
  date: string;
  performedBy: string;
  itemName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PRFulfillmentService {
  private baseUrl = '/api/purchase/fulfillment';
  private fulfillmentsSubject = new BehaviorSubject<PRFulfillment[]>([]);
  public fulfillments$ = this.fulfillmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<PRFulfillment[]> {
    return this.http.get<PRFulfillment[]>(this.baseUrl);
  }

  getAllPOs(): Observable<PRFulfillment[]> {
    return this.http.get<PRFulfillment[]>(`${this.baseUrl}/pos`);
  }

  getPOById(id: number): Observable<PRFulfillment> {
    return this.http.get<PRFulfillment>(`${this.baseUrl}/pos/${id}`);
  }

  getByPrId(prId: number): Observable<PRFulfillment[]> {
    return this.http.get<PRFulfillment[]>(`${this.baseUrl}/pr/${prId}`);
  }

  getFulfillmentHistory(prId: number): Observable<FulfillmentHistory[]> {
    return this.http.get<FulfillmentHistory[]>(`${this.baseUrl}/pr/${prId}/history`);
  }

  createPOFulfillment(fulfillment: PRFulfillment): Observable<PRFulfillment> {
    return this.http.post<PRFulfillment>(`${this.baseUrl}/convert-to-po`, fulfillment);
  }

  createStockIssueFulfillment(fulfillment: PRFulfillment): Observable<PRFulfillment> {
    return this.http.post<PRFulfillment>(`${this.baseUrl}/stock-issue`, fulfillment);
  }

  createMaterialTransferFulfillment(fulfillment: PRFulfillment): Observable<PRFulfillment> {
    return this.http.post<PRFulfillment>(`${this.baseUrl}/material-transfer`, fulfillment);
  }

  generatePONumber(): string {
    const prefix = 'PO';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}${random}`;
  }

  generateIssueNumber(): string {
    const prefix = 'SI';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}${random}`;
  }

  generateTransferNumber(): string {
    const prefix = 'MT';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}${random}`;
  }
}
