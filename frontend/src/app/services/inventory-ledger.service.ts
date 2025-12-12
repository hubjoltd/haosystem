import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LedgerItem {
  id: number;
  code: string;
  name: string;
}

export interface LedgerWarehouse {
  id: number;
  code: string;
  name: string;
}

export interface InventoryLedger {
  id?: number;
  item?: LedgerItem;
  warehouse?: LedgerWarehouse;
  bin?: { id: number; code: string; name: string };
  transactionType: string;
  referenceNumber: string;
  quantityIn: number;
  quantityOut: number;
  balanceQuantity: number;
  unitValue: number;
  totalValue: number;
  transactionDate: string;
  remarks: string;
}

export interface LedgerFilter {
  itemId?: number;
  warehouseId?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryLedgerService {
  private baseUrl = '/api/inventory/ledger';

  constructor(private http: HttpClient) {}

  getAll(filter?: LedgerFilter): Observable<InventoryLedger[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.itemId) params = params.set('itemId', filter.itemId.toString());
      if (filter.warehouseId) params = params.set('warehouseId', filter.warehouseId.toString());
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
    }
    return this.http.get<InventoryLedger[]>(this.baseUrl, { params });
  }

  getByItem(itemId: number): Observable<InventoryLedger[]> {
    return this.http.get<InventoryLedger[]>(`${this.baseUrl}/item/${itemId}`);
  }
}
