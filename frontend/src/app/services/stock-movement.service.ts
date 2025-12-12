import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GRNLine {
  id?: number;
  itemId?: number;
  itemName?: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  binId?: number;
  binName?: string;
}

export interface GoodsReceipt {
  id?: number;
  grnNumber: string;
  receiptDate: string;
  supplier?: string;
  supplierId?: number;
  warehouse?: string;
  warehouseId?: number;
  referenceNumber?: string;
  totalValue?: number;
  status: string;
  remarks?: string;
  lines?: GRNLine[];
}

export interface GoodsIssueLine {
  id?: number;
  itemId?: number;
  itemName?: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  binId?: number;
  binName?: string;
}

export interface GoodsIssue {
  id?: number;
  issueNumber: string;
  issueDate: string;
  customer?: string;
  customerId?: number;
  warehouse?: string;
  warehouseId?: number;
  issueType?: string;
  referenceNumber?: string;
  totalValue?: number;
  status: string;
  remarks?: string;
  allowNegativeStock?: boolean;
  lines?: GoodsIssueLine[];
}

export interface StockTransferLine {
  id?: number;
  itemId?: number;
  itemName?: string;
  itemCode?: string;
  quantity: number;
  fromBinId?: number;
  fromBinName?: string;
  toBinId?: number;
  toBinName?: string;
}

export interface StockTransfer {
  id?: number;
  transferNumber: string;
  transferDate: string;
  fromWarehouse?: string;
  fromWarehouseId?: number;
  toWarehouse?: string;
  toWarehouseId?: number;
  status: string;
  remarks?: string;
  lines?: StockTransferLine[];
}

export interface StockAdjustment {
  id?: number;
  adjustmentNumber: string;
  adjustmentDate: string;
  adjustmentType: string;
  item?: string;
  itemId?: number;
  itemCode?: string;
  warehouse?: string;
  warehouseId?: number;
  bin?: string;
  binId?: number;
  quantityBefore?: number;
  quantityAdjusted: number;
  quantityAfter?: number;
  valueDifference?: number;
  reason: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private baseUrl = '/api/stock-movement';

  constructor(private http: HttpClient) {}

  getAllGRN(): Observable<GoodsReceipt[]> {
    return this.http.get<GoodsReceipt[]>(`${this.baseUrl}/grn`);
  }

  getGRNById(id: number): Observable<GoodsReceipt> {
    return this.http.get<GoodsReceipt>(`${this.baseUrl}/grn/${id}`);
  }

  createGRN(grn: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/grn`, grn);
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

  createIssue(issue: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/issues`, issue);
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

  createTransfer(transfer: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers`, transfer);
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

  createAdjustment(adjustment: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/adjustments`, adjustment);
  }

  deleteAdjustment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/adjustments/${id}`);
  }

  approveAdjustment(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/adjustments/${id}/approve`, {});
  }

  rejectAdjustment(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/adjustments/${id}/reject`, {});
  }
}
