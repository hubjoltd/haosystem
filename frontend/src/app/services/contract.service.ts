import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contract {
  id?: number;
  contractNumber?: string;
  title: string;
  description: string;
  customer?: any;
  customerId?: number;
  startDate: string;
  endDate: string;
  value: number;
  status: string;
  paymentTerms: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private baseUrl = '/api/contracts';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.baseUrl);
  }

  getById(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/${id}`);
  }

  create(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(this.baseUrl, contract);
  }

  update(id: number, contract: Contract): Observable<Contract> {
    return this.http.put<Contract>(`${this.baseUrl}/${id}`, contract);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
