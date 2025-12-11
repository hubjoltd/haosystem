import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemGroup } from './item-group.service';
import { UnitOfMeasure } from './unit-of-measure.service';
import { Supplier } from './supplier.service';

export interface Item {
  id?: number;
  code: string;
  name: string;
  description: string;
  group?: ItemGroup;
  unitOfMeasure?: UnitOfMeasure;
  unitCost?: number;
  supplier?: Supplier;
  taxable: boolean;
  currentStock: number;
  reorderLevel?: number;
  status: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface ValidateNameResponse {
  isUnique: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private baseUrl = '/api/inventory/items';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl);
  }

  getActive(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/active`);
  }

  getById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  getByGroup(groupId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/group/${groupId}`);
  }

  validateName(name: string, groupId: number, excludeId?: number): Observable<ValidateNameResponse> {
    let url = `${this.baseUrl}/validate-name?name=${encodeURIComponent(name)}&groupId=${groupId}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return this.http.get<ValidateNameResponse>(url);
  }

  create(item: Item): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, item);
  }

  update(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getLowStock(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/low-stock`);
  }
}
