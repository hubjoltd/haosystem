import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemGroup {
  id?: number;
  code: string;
  name: string;
  description: string;
  status: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface CanDeactivateResponse {
  canDeactivate: boolean;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemGroupService {
  private baseUrl = '/api/inventory/groups';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ItemGroup[]> {
    return this.http.get<ItemGroup[]>(this.baseUrl);
  }

  getActive(): Observable<ItemGroup[]> {
    return this.http.get<ItemGroup[]>(`${this.baseUrl}/active`);
  }

  getById(id: number): Observable<ItemGroup> {
    return this.http.get<ItemGroup>(`${this.baseUrl}/${id}`);
  }

  canDeactivate(id: number): Observable<CanDeactivateResponse> {
    return this.http.get<CanDeactivateResponse>(`${this.baseUrl}/${id}/can-deactivate`);
  }

  create(group: ItemGroup): Observable<ItemGroup> {
    return this.http.post<ItemGroup>(this.baseUrl, group);
  }

  update(id: number, group: ItemGroup): Observable<ItemGroup> {
    return this.http.put<ItemGroup>(`${this.baseUrl}/${id}`, group);
  }

  deactivate(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
