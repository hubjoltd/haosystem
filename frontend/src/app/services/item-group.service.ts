import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemGroup {
  id?: number;
  code: string;
  name: string;
  description: string;
  status: string;
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

  getById(id: number): Observable<ItemGroup> {
    return this.http.get<ItemGroup>(`${this.baseUrl}/${id}`);
  }

  create(group: ItemGroup): Observable<ItemGroup> {
    return this.http.post<ItemGroup>(this.baseUrl, group);
  }

  update(id: number, group: ItemGroup): Observable<ItemGroup> {
    return this.http.put<ItemGroup>(`${this.baseUrl}/${id}`, group);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
