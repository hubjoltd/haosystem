import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DirectPurchaseItem {
  id?: number;
  itemName: string;
  description: string;
  quantity: number;
  uom: string;
  unit?: string;
  rate: number;
  amount: number;
  remarks: string;
}

export interface DirectPurchase {
  id?: number;
  poNumber?: string;
  prNumber?: string;
  prId?: number;
  poType: string;
  poDate?: string;
  expectedDate?: string;
  supplierId: number;
  supplierName?: string;
  supplierAddress?: string;
  supplierContact?: string;
  deliveryLocation: string;
  paymentTerms: string;
  deliveryDate: string;
  createdDate?: string;
  status: string;
  items: DirectPurchaseItem[];
  totalAmount?: number;
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DirectPurchaseService {
  private baseUrl = '/api/purchase/direct';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DirectPurchase[]> {
    return this.http.get<DirectPurchase[]>(this.baseUrl);
  }

  getById(id: number): Observable<DirectPurchase> {
    return this.http.get<DirectPurchase>(`${this.baseUrl}/${id}`);
  }

  create(purchase: DirectPurchase): Observable<DirectPurchase> {
    return this.http.post<DirectPurchase>(this.baseUrl, purchase);
  }

  update(id: number, purchase: DirectPurchase): Observable<DirectPurchase> {
    return this.http.put<DirectPurchase>(`${this.baseUrl}/${id}`, purchase);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
