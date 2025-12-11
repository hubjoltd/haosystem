import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoodsReceipt {
  id?: number;
  grnNumber?: string;
  supplier?: any;
  warehouse?: any;
  receiptDate: string;
  referenceNumber: string;
  remarks: string;
  totalValue?: number;
  status: string;
  createdAt?: string;
}

export interface GoodsIssue {
  id?: number;
  issueNumber?: string;
  customer?: any;
  warehouse?: any;
  issueDate: string;
  referenceNumber: string;
  remarks: string;
  totalValue?: number;
  status: string;
  createdAt?: string;
}

export interface StockTransfer {
  id?: number;
  transferNumber?: string;
  fromWarehouse?: any;
  toWarehouse?: any;
  transferDate: string;
  remarks: string;
  status: string;
  createdAt?: string;
}

export interface StockAdjustment {
  id?: number;
  adjustmentNumber?: string;
  warehouse?: any;
  item?: any;
  bin?: any;
  adjustmentType: string;
  quantityBefore?: number;
  quantityAdjusted: number;
  quantityAfter?: number;
  valueDifference?: number;
  reason: string;
  adjustmentDate: string;
  status: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private baseUrl = '/api/stock';

  constructor(private http: HttpClient) {}

  getAllGRN(): Observable<GoodsReceipt[]> {
    return this.http.get<GoodsReceipt[]>(`${this.baseUrl}/grn`);
  }

  getGRNById(id: number): Observable<GoodsReceipt> {
    return this.http.get<GoodsReceipt>(`${this.baseUrl}/grn/${id}`);
  }

  createGRN(grn: any): Observable<GoodsReceipt> {
    return this.http.post<GoodsReceipt>(`${this.baseUrl}/grn`, grn);
  }

  deleteGRN(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/grn/${id}`);
  }

  getAllIssues(): Observable<GoodsIssue[]> {
    return this.http.get<GoodsIssue[]>(`${this.baseUrl}/issues`);
  }

  getIssueById(id: number): Observable<GoodsIssue> {
    return this.http.get<GoodsIssue>(`${this.baseUrl}/issues/${id}`);
  }

  deleteIssue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/issues/${id}`);
  }

  getAllTransfers(): Observable<StockTransfer[]> {
    return this.http.get<StockTransfer[]>(`${this.baseUrl}/transfers`);
  }

  getTransferById(id: number): Observable<StockTransfer> {
    return this.http.get<StockTransfer>(`${this.baseUrl}/transfers/${id}`);
  }

  deleteTransfer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transfers/${id}`);
  }

  getAllAdjustments(): Observable<StockAdjustment[]> {
    return this.http.get<StockAdjustment[]>(`${this.baseUrl}/adjustments`);
  }

  getAdjustmentById(id: number): Observable<StockAdjustment> {
    return this.http.get<StockAdjustment>(`${this.baseUrl}/adjustments/${id}`);
  }

  deleteAdjustment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/adjustments/${id}`);
  }
}
