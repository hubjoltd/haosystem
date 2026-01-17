import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountingService } from '../../../services/accounting.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-finance-settings',
  standalone: false,
  templateUrl: './finance-settings.component.html',
  styleUrls: ['./finance-settings.component.scss']
})
export class FinanceSettingsComponent implements OnInit {
  loading = false;
  activeTab = 'general';
  
  generalSettings: any = {};
  accountDetailTypes: any[] = [];
  plaidSettings: any = {};
  incomeStatementSettings: any = {};
  currencyRates: any[] = [];
  
  showAddDetailType = false;
  showAddCurrency = false;
  
  newDetailType = { accountType: '', name: '', description: '' };
  newCurrencyRate = { currencyCode: '', currencyName: '', exchangeRate: null, effectiveDate: '' };

  tabs = [
    { id: 'general', name: 'General', icon: 'fas fa-cog' },
    { id: 'account-types', name: 'Account Detail Types', icon: 'fas fa-list' },
    { id: 'plaid', name: 'Plaid Environment', icon: 'fas fa-link' },
    { id: 'income-statement', name: 'Income Statement', icon: 'fas fa-file-alt' },
    { id: 'currency-rates', name: 'Currency Rates', icon: 'fas fa-coins' }
  ];

  constructor(
    private accountingService: AccountingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGeneralSettings();
  }

  selectTab(tabId: string): void {
    this.activeTab = tabId;
    this.cdr.detectChanges();
    switch (tabId) {
      case 'general': this.loadGeneralSettings(); break;
      case 'account-types': this.loadAccountDetailTypes(); break;
      case 'plaid': this.loadPlaidSettings(); break;
      case 'income-statement': this.loadIncomeStatementSettings(); break;
      case 'currency-rates': this.loadCurrencyRates(); break;
    }
  }

  loadGeneralSettings(): void {
    this.loading = true;
    this.accountingService.getGeneralSettings().subscribe({
      next: (data) => { this.generalSettings = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to load settings'); this.cdr.detectChanges(); }
    });
  }

  saveGeneralSettings(): void {
    this.loading = true;
    this.accountingService.updateGeneralSettings(this.generalSettings).subscribe({
      next: () => { this.loading = false; this.notificationService.success('Settings saved successfully'); this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to save settings'); this.cdr.detectChanges(); }
    });
  }

  loadAccountDetailTypes(): void {
    this.loading = true;
    this.accountingService.getAccountDetailTypes().subscribe({
      next: (data) => { this.accountDetailTypes = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to load account types'); this.cdr.detectChanges(); }
    });
  }

  addAccountDetailType(): void {
    if (!this.newDetailType.name || !this.newDetailType.accountType) return;
    this.accountingService.createAccountDetailType(this.newDetailType).subscribe({
      next: (data) => {
        this.accountDetailTypes.push(data);
        this.newDetailType = { accountType: '', name: '', description: '' };
        this.showAddDetailType = false;
        this.notificationService.success('Account detail type added');
        this.cdr.detectChanges();
      },
      error: () => { this.notificationService.error('Failed to add account type'); this.cdr.detectChanges(); }
    });
  }

  loadPlaidSettings(): void {
    this.loading = true;
    this.accountingService.getPlaidSettings().subscribe({
      next: (data) => { this.plaidSettings = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to load Plaid settings'); this.cdr.detectChanges(); }
    });
  }

  savePlaidSettings(): void {
    this.loading = true;
    this.accountingService.updatePlaidSettings(this.plaidSettings).subscribe({
      next: () => { this.loading = false; this.notificationService.success('Plaid settings saved'); this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to save Plaid settings'); this.cdr.detectChanges(); }
    });
  }

  loadIncomeStatementSettings(): void {
    this.loading = true;
    this.accountingService.getIncomeStatementSettings().subscribe({
      next: (data) => { this.incomeStatementSettings = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to load settings'); this.cdr.detectChanges(); }
    });
  }

  saveIncomeStatementSettings(): void {
    this.loading = true;
    this.accountingService.updateIncomeStatementSettings(this.incomeStatementSettings).subscribe({
      next: () => { this.loading = false; this.notificationService.success('Income statement settings saved'); this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to save settings'); this.cdr.detectChanges(); }
    });
  }

  loadCurrencyRates(): void {
    this.loading = true;
    this.accountingService.getCurrencyRates().subscribe({
      next: (data) => { this.currencyRates = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.notificationService.error('Failed to load currency rates'); this.cdr.detectChanges(); }
    });
  }

  addCurrencyRate(): void {
    if (!this.newCurrencyRate.currencyCode || !this.newCurrencyRate.exchangeRate) return;
    this.accountingService.createCurrencyRate(this.newCurrencyRate).subscribe({
      next: (data) => {
        this.currencyRates.push(data);
        this.newCurrencyRate = { currencyCode: '', currencyName: '', exchangeRate: null, effectiveDate: '' };
        this.showAddCurrency = false;
        this.notificationService.success('Currency rate added');
        this.cdr.detectChanges();
      },
      error: () => { this.notificationService.error('Failed to add currency rate'); this.cdr.detectChanges(); }
    });
  }

  deleteCurrencyRate(rate: any): void {
    if (!confirm('Delete this currency rate?')) return;
    this.accountingService.deleteCurrencyRate(rate.id).subscribe({
      next: () => {
        this.currencyRates = this.currencyRates.filter(r => r.id !== rate.id);
        this.notificationService.success('Currency rate deleted');
        this.cdr.detectChanges();
      },
      error: () => { this.notificationService.error('Failed to delete currency rate'); this.cdr.detectChanges(); }
    });
  }

  fetchLatestRates(): void {
    this.loading = true;
    this.accountingService.fetchLatestCurrencyRates().subscribe({
      next: () => { 
        this.loadCurrencyRates();
        this.notificationService.success('Currency rates updated');
      },
      error: () => { this.loading = false; this.notificationService.error('Failed to fetch rates'); this.cdr.detectChanges(); }
    });
  }
}
