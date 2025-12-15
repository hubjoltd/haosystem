import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContractType {
  id?: number;
  name: string;
  duration: number;
  renewable: boolean;
}

export interface ContractStatus {
  id?: number;
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractSettingsService {
  private apiUrl = '/api/settings/contract';

  constructor(private http: HttpClient) {}

  getTypes(): Observable<ContractType[]> {
    return this.http.get<ContractType[]>(`${this.apiUrl}/types`);
  }

  createType(type: ContractType): Observable<ContractType> {
    return this.http.post<ContractType>(`${this.apiUrl}/types`, type);
  }

  updateType(id: number, type: ContractType): Observable<ContractType> {
    return this.http.put<ContractType>(`${this.apiUrl}/types/${id}`, type);
  }

  deleteType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
  }

  getStatuses(): Observable<ContractStatus[]> {
    return this.http.get<ContractStatus[]>(`${this.apiUrl}/statuses`);
  }

  createStatus(status: ContractStatus): Observable<ContractStatus> {
    return this.http.post<ContractStatus>(`${this.apiUrl}/statuses`, status);
  }

  updateStatus(id: number, status: ContractStatus): Observable<ContractStatus> {
    return this.http.put<ContractStatus>(`${this.apiUrl}/statuses/${id}`, status);
  }

  deleteStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/statuses/${id}`);
  }
}
