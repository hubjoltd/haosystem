import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UnitOfMeasure {
  id?: number;
  code: string;
  name: string;
  symbol: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnitOfMeasureService {
  private baseUrl = '/api/inventory/units';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UnitOfMeasure[]> {
    return this.http.get<UnitOfMeasure[]>(this.baseUrl);
  }

  getById(id: number): Observable<UnitOfMeasure> {
    return this.http.get<UnitOfMeasure>(`${this.baseUrl}/${id}`);
  }

  create(unit: UnitOfMeasure): Observable<UnitOfMeasure> {
    return this.http.post<UnitOfMeasure>(this.baseUrl, unit);
  }

  update(id: number, unit: UnitOfMeasure): Observable<UnitOfMeasure> {
    return this.http.put<UnitOfMeasure>(`${this.baseUrl}/${id}`, unit);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
