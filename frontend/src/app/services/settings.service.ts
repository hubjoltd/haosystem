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
  valuationMethod: string; // FIFO, LIFO, WEIGHTED_AVERAGE
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

export interface PrefixSettings {
  id?: number;
  // Inventory Prefixes
  itemPrefix: string;
  itemNextNumber: number;
  groupPrefix: string;
  groupNextNumber: number;
  warehousePrefix: string;
  warehouseNextNumber: number;
  binPrefix: string;
  binNextNumber: number;
  supplierPrefix: string;
  supplierNextNumber: number;
  unitPrefix: string;
  unitNextNumber: number;
  // Purchase Prefixes
  prPrefix: string;
  prNextNumber: number;
  poPrefix: string;
  poNextNumber: number;
  grnPrefix: string;
  grnNextNumber: number;
  // Stock Movement Prefixes
  issuePrefix: string;
  issueNextNumber: number;
  transferPrefix: string;
  transferNextNumber: number;
  adjustmentPrefix: string;
  adjustmentNextNumber: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = '/api/settings';

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

  getPrefixSettings(): Observable<PrefixSettings> {
    return this.http.get<PrefixSettings>(`${this.baseUrl}/prefixes`);
  }

  savePrefixSettings(settings: PrefixSettings): Observable<PrefixSettings> {
    return this.http.post<PrefixSettings>(`${this.baseUrl}/prefixes`, settings);
  }

  generatePrefixId(type: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/prefixes/generate/${type}`, { responseType: 'text' });
  }
}
