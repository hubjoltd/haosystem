import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService, GeneralSettings } from '../../../services/settings.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { BranchService, Branch } from '../../../services/branch.service';

@Component({
  selector: 'app-general-settings',
  standalone: false,
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingsComponent implements OnInit {
  settings: GeneralSettings = {
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'UTC',
    logoPath: '',
    valuationMethod: 'FIFO'
  };
  
  saving: boolean = false;
  loading: boolean = false;
  currentBranch: Branch | null = null;
  currentBranchId: number | null = null;

  timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
  dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  valuationMethods = [
    { value: 'FIFO', label: 'FIFO (First In, First Out)' },
    { value: 'LIFO', label: 'LIFO (Last In, First Out)' },
    { value: 'WEIGHTED_AVERAGE', label: 'Weighted Average Cost' }
  ];

  constructor(
    private settingsService: SettingsService, 
    private notificationService: NotificationService,
    private authService: AuthService,
    private branchService: BranchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentBranchId = this.authService.getCurrentBranchId();
    this.loadCurrentBranch();
    this.loadSettings();
  }

  loadCurrentBranch(): void {
    if (this.currentBranchId) {
      this.branchService.getBranchById(this.currentBranchId).subscribe({
        next: (branch) => {
          this.currentBranch = branch;
          this.settings.companyName = branch.name || '';
          this.settings.companyAddress = branch.address || '';
          this.settings.companyPhone = branch.phone || '';
          this.settings.companyEmail = branch.email || '';
          this.settings.companyWebsite = branch.website || '';
          this.settings.currency = branch.currency || 'USD';
          this.settings.dateFormat = branch.dateFormat || 'DD/MM/YYYY';
          this.settings.timezone = branch.timezone || 'UTC';
          this.settings.logoPath = branch.logoPath || '';
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading current branch:', err);
          this.cdr.markForCheck();
        }
      });
    }
  }

  loadSettings(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.settingsService.getGeneralSettings().subscribe({
      next: (data) => {
        if (data && !this.currentBranchId) {
          this.settings = data;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading settings', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.cdr.markForCheck();
    
    if (this.currentBranchId && this.currentBranch) {
      const branchUpdate: Partial<Branch> = {
        name: this.settings.companyName,
        address: this.settings.companyAddress,
        phone: this.settings.companyPhone,
        email: this.settings.companyEmail,
        website: this.settings.companyWebsite,
        currency: this.settings.currency,
        dateFormat: this.settings.dateFormat,
        timezone: this.settings.timezone
      };
      
      this.branchService.updateBranch(this.currentBranchId, branchUpdate).subscribe({
        next: (updated) => {
          this.currentBranch = updated;
          this.saving = false;
          this.notificationService.success('Company settings saved successfully');
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error saving settings', err);
          this.saving = false;
          this.notificationService.error('Error saving settings');
          this.cdr.markForCheck();
        }
      });
    } else {
      this.settingsService.saveGeneralSettings(this.settings).subscribe({
        next: (data) => {
          this.settings = data;
          this.saving = false;
          this.notificationService.success('Settings saved successfully');
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error saving settings', err);
          this.saving = false;
          this.notificationService.error('Error saving settings');
          this.cdr.markForCheck();
        }
      });
    }
  }

  resetSettings(): void {
    this.loadCurrentBranch();
    this.loadSettings();
    this.notificationService.info('Settings reset to saved values');
  }
}
