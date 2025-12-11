import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GeneralSettings {
  id?: number;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  logoPath: string;
}

export interface FinanceSettings {
  id?: number;
  taxId: string;
  taxRate: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  paymentTermsDefault: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  fiscalYearStart: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) {}

  getGeneralSettings(): Observable<GeneralSettings> {
    return this.http.get<GeneralSettings>(`${this.baseUrl}/general`);
  }

  saveGeneralSettings(settings: GeneralSettings): Observable<GeneralSettings> {
    return this.http.post<GeneralSettings>(`${this.baseUrl}/general`, settings);
  }

  getFinanceSettings(): Observable<FinanceSettings> {
    return this.http.get<FinanceSettings>(`${this.baseUrl}/finance`);
  }

  saveFinanceSettings(settings: FinanceSettings): Observable<FinanceSettings> {
    return this.http.post<FinanceSettings>(`${this.baseUrl}/finance`, settings);
  }
}
