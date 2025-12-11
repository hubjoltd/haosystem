import { Component } from '@angular/core';

@Component({
  selector: 'app-general-settings',
  standalone: false,
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent {
  companyName: string = 'My Company Ltd.';
  companyEmail: string = 'info@mycompany.com';
  companyPhone: string = '+1 234 567 8900';
  companyAddress: string = '123 Business Street, City, Country';
  timezone: string = 'UTC';
  dateFormat: string = 'DD/MM/YYYY';
  language: string = 'en';

  timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
  dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }
  ];

  saveSettings() {
    console.log('Settings saved');
  }
}
