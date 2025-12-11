import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Warehouse {
  id?: number;
  code: string;
  name: string;
  location: string;
  capacity: number;
  usedCapacity: number;
  status: string;
}

export interface Bin {
  id?: number;
  code: string;
  name: string;
  warehouse?: Warehouse;
  warehouseId?: number;
  capacity: number;
  usedCapacity: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private warehouseUrl = 'http://localhost:8080/api/inventory/warehouses';
  private binUrl = 'http://localhost:8080/api/inventory/bins';

  constructor(private http: HttpClient) {}

  getAllWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.warehouseUrl);
  }

  getWarehouseById(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.warehouseUrl}/${id}`);
  }

  createWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.warehouseUrl, warehouse);
  }

  updateWarehouse(id: number, warehouse: Warehouse): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.warehouseUrl}/${id}`, warehouse);
  }

  deleteWarehouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.warehouseUrl}/${id}`);
  }

  getAllBins(): Observable<Bin[]> {
    return this.http.get<Bin[]>(this.binUrl);
  }

  getBinsByWarehouse(warehouseId: number): Observable<Bin[]> {
    return this.http.get<Bin[]>(`${this.binUrl}/warehouse/${warehouseId}`);
  }

  getBinById(id: number): Observable<Bin> {
    return this.http.get<Bin>(`${this.binUrl}/${id}`);
  }

  createBin(bin: Bin): Observable<Bin> {
    return this.http.post<Bin>(this.binUrl, bin);
  }

  updateBin(id: number, bin: Bin): Observable<Bin> {
    return this.http.put<Bin>(`${this.binUrl}/${id}`, bin);
  }

  deleteBin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.binUrl}/${id}`);
  }
}
