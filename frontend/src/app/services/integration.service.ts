import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IntegrationConfig, IntegrationSyncLog, IntegrationType } from '../models/integration.model';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private apiUrl = '/api/integrations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IntegrationConfig[]> {
    return this.http.get<IntegrationConfig[]>(this.apiUrl);
  }

  getById(id: number): Observable<IntegrationConfig> {
    return this.http.get<IntegrationConfig>(`${this.apiUrl}/${id}`);
  }

  getByType(type: string): Observable<IntegrationConfig[]> {
    return this.http.get<IntegrationConfig[]>(`${this.apiUrl}/type/${type}`);
  }

  getActive(): Observable<IntegrationConfig[]> {
    return this.http.get<IntegrationConfig[]>(`${this.apiUrl}/active`);
  }

  getTypes(): Observable<IntegrationType[]> {
    return this.http.get<IntegrationType[]>(`${this.apiUrl}/types`);
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status`);
  }

  create(config: Partial<IntegrationConfig>): Observable<IntegrationConfig> {
    return this.http.post<IntegrationConfig>(this.apiUrl, config);
  }

  update(id: number, config: Partial<IntegrationConfig>): Observable<IntegrationConfig> {
    return this.http.put<IntegrationConfig>(`${this.apiUrl}/${id}`, config);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<IntegrationConfig> {
    return this.http.post<IntegrationConfig>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  testConnection(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/test`, {});
  }

  triggerSync(id: number, syncType: string = 'FULL', triggeredBy?: string): Observable<IntegrationSyncLog> {
    let url = `${this.apiUrl}/${id}/sync?syncType=${syncType}`;
    if (triggeredBy) {
      url += `&triggeredBy=${triggeredBy}`;
    }
    return this.http.post<IntegrationSyncLog>(url, {});
  }

  getSyncLogs(id: number): Observable<IntegrationSyncLog[]> {
    return this.http.get<IntegrationSyncLog[]>(`${this.apiUrl}/${id}/sync-logs`);
  }
}
