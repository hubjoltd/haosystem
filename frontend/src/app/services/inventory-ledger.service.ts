import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryLedger {
  id?: number;
  item?: any;
  warehouse?: any;
  bin?: any;
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

@Injectable({
  providedIn: 'root'
})
export class InventoryLedgerService {
  private baseUrl = '/api/inventory/ledger';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryLedger[]> {
    return this.http.get<InventoryLedger[]>(this.baseUrl);
  }

  getByItem(itemId: number): Observable<InventoryLedger[]> {
    return this.http.get<InventoryLedger[]>(`${this.baseUrl}/item/${itemId}`);
  }
}
