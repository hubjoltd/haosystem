import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuditTrail, AuditFilter, AuditModule } from '../models/audit-trail.model';

@Injectable({
  providedIn: 'root'
})
export class AuditTrailService {
  private apiUrl = '/api/audit';

  constructor(private http: HttpClient) {}

  getAll(filter?: AuditFilter): Observable<AuditTrail[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.module) params = params.set('module', filter.module);
      if (filter.entityType) params = params.set('entityType', filter.entityType);
      if (filter.action) params = params.set('action', filter.action);
      if (filter.performedBy) params = params.set('performedBy', filter.performedBy);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.searchTerm) params = params.set('search', filter.searchTerm);
    }
    return this.http.get<AuditTrail[]>(this.apiUrl, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getByModule(module: AuditModule, filter?: AuditFilter): Observable<AuditTrail[]> {
    let params = new HttpParams().set('module', module);
    if (filter) {
      if (filter.entityType) params = params.set('entityType', filter.entityType);
      if (filter.action) params = params.set('action', filter.action);
      if (filter.performedBy) params = params.set('performedBy', filter.performedBy);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.searchTerm) params = params.set('search', filter.searchTerm);
    }
    return this.http.get<AuditTrail[]>(this.apiUrl, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getSystemAudits(filter?: AuditFilter): Observable<AuditTrail[]> {
    return this.getByModule('SYSTEM', filter);
  }

  getInventoryAudits(filter?: AuditFilter): Observable<AuditTrail[]> {
    const params = new HttpParams().set('modules', 'INVENTORY,STOCK_MOVEMENT');
    return this.http.get<AuditTrail[]>(this.apiUrl, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getPurchaseAudits(filter?: AuditFilter): Observable<AuditTrail[]> {
    return this.getByModule('PURCHASE', filter);
  }

  getByEntityId(entityType: string, entityId: number): Observable<AuditTrail[]> {
    return this.http.get<AuditTrail[]>(`${this.apiUrl}/entity/${entityType}/${entityId}`).pipe(
      catchError(() => of([]))
    );
  }

  exportToExcel(filter?: AuditFilter): Observable<Blob> {
    let params = new HttpParams();
    if (filter) {
      if (filter.module) params = params.set('module', filter.module);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
    }
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }
}
