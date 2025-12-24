import { Component, OnInit } from '@angular/core';
import { SettingsService, GeneralSettings } from '../../../services/settings.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-general-settings',
  standalone: false,
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
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

  timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
  dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  valuationMethods = [
    { value: 'FIFO', label: 'FIFO (First In, First Out)' },
    { value: 'LIFO', label: 'LIFO (Last In, First Out)' },
    { value: 'WEIGHTED_AVERAGE', label: 'Weighted Average Cost' }
  ];

  constructor(private settingsService: SettingsService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = false;
    this.settingsService.getGeneralSettings().subscribe({
      next: (data) => {
        if (data) {
          this.settings = data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading settings', err);
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.settingsService.saveGeneralSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.saving = false;
        this.notificationService.success('Settings saved successfully');
      },
      error: (err) => {
        console.error('Error saving settings', err);
        this.saving = false;
        this.notificationService.error('Error saving settings');
      }
    });
  }
}
