import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type PRStatus = 'Draft' | 'Submitted' | 'Approved' | 'Partially Fulfilled' | 'Fully Fulfilled' | 'Rejected';
export type PRItemStatus = 'Pending' | 'Partially Fulfilled' | 'Fully Fulfilled';

export interface PRItem {
  id?: number;
  itemId?: number;
  itemCode?: string;
  itemName: string;
  itemDescription: string;
  quantity: number;
  fulfilledQuantity?: number;
  uom: string;
  remarks: string;
  status?: PRItemStatus;
}

export interface StockFulfillmentItem {
  id?: number;
  prItemId: number;
  itemId: number;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  uom?: string;
}

export interface StockFulfillment {
  id?: number;
  fulfillmentNumber?: string;
  prId: number;
  prNumber?: string;
  warehouseId?: number;
  warehouseName?: string;
  supplierId?: number;
  supplierName?: string;
  fulfillmentDate?: string;
  remarks?: string;
  items: StockFulfillmentItem[];
  createdAt?: string;
  createdBy?: string;
}

export interface MaterialTransferItem {
  id?: number;
  prItemId: number;
  itemId: number;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  uom?: string;
}

export interface MaterialTransfer {
  id?: number;
  transferNumber?: string;
  prId: number;
  prNumber?: string;
  projectName?: string;
  supplierId?: number;
  supplierName?: string;
  transferDate?: string;
  remarks?: string;
  items: MaterialTransferItem[];
  createdAt?: string;
  createdBy?: string;
}

export interface PurchaseRequisition {
  id?: number;
  prNumber?: string;
  prDate: string;
  requiredDate: string;
  requestedBy: string;
  requestedById?: number;
  department: string;
  deliveryLocation: string;
  purpose: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  status: PRStatus;
  items: PRItem[];
  remarks?: string;
  commentsCount?: number;
  createdAt?: string;
  createdBy?: string;
  createdById?: number;
  submittedAt?: string;
  submittedBy?: string;
  submittedById?: number;
  approvedAt?: string;
  approvedBy?: string;
  approvedById?: number;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedById?: number;
  rejectionReason?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequisitionService {
  private baseUrl = '/api/purchase/requisitions';
  private fulfillmentUrl = '/api/purchase/fulfillment';
  private requisitionsSubject = new BehaviorSubject<PurchaseRequisition[]>([]);
  public requisitions$ = this.requisitionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseRequisition[]> {
    return this.http.get<PurchaseRequisition[]>(this.baseUrl).pipe(
      tap(data => this.requisitionsSubject.next(data))
    );
  }

  getById(id: number): Observable<PurchaseRequisition> {
    return this.http.get<PurchaseRequisition>(`${this.baseUrl}/${id}`);
  }

  create(pr: PurchaseRequisition): Observable<PurchaseRequisition> {
    return this.http.post<PurchaseRequisition>(this.baseUrl, pr);
  }

  update(id: number, pr: PurchaseRequisition): Observable<PurchaseRequisition> {
    return this.http.put<PurchaseRequisition>(`${this.baseUrl}/${id}`, pr);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  submit(id: number): Observable<PurchaseRequisition> {
    return this.http.post<PurchaseRequisition>(`${this.baseUrl}/${id}/submit`, {});
  }

  approve(id: number): Observable<PurchaseRequisition> {
    return this.http.post<PurchaseRequisition>(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: number, reason?: string): Observable<PurchaseRequisition> {
    return this.http.post<PurchaseRequisition>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  getByStatus(status: string): Observable<PurchaseRequisition[]> {
    return this.requisitions$.pipe(
      map(prs => prs.filter(pr => pr.status === status))
    );
  }

  generatePRNumber(): string {
    const prefix = 'PR';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}${random}`;
  }

  getStockFulfillmentsByPrId(prId: number): Observable<StockFulfillment[]> {
    return this.http.get<StockFulfillment[]>(`${this.fulfillmentUrl}/pr/${prId}/stock-fulfillments`);
  }

  getMaterialTransfersByPrId(prId: number): Observable<MaterialTransfer[]> {
    return this.http.get<MaterialTransfer[]>(`${this.fulfillmentUrl}/pr/${prId}/material-transfers`);
  }

  getAllStockFulfillments(): Observable<StockFulfillment[]> {
    return this.http.get<StockFulfillment[]>(`${this.fulfillmentUrl}/stock-fulfillments`);
  }

  getAllMaterialTransfers(): Observable<MaterialTransfer[]> {
    return this.http.get<MaterialTransfer[]>(`${this.fulfillmentUrl}/material-transfers`);
  }

  createStockFulfillment(fulfillment: StockFulfillment): Observable<StockFulfillment> {
    return this.http.post<StockFulfillment>(`${this.fulfillmentUrl}/stock-fulfillment`, fulfillment);
  }

  createMaterialTransfer(transfer: MaterialTransfer): Observable<MaterialTransfer> {
    return this.http.post<MaterialTransfer>(`${this.fulfillmentUrl}/material-transfer-new`, transfer);
  }

  getPurchaseOrdersByPrId(prId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.fulfillmentUrl}/pr/${prId}/purchase-orders`);
  }
}
