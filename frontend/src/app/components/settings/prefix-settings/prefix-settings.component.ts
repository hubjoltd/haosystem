import { Component, OnInit } from '@angular/core';
import { SettingsService, PrefixSettings } from '../../../services/settings.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-prefix-settings',
  standalone: false,
  templateUrl: './prefix-settings.component.html',
  styleUrls: ['./prefix-settings.component.scss']
})
export class PrefixSettingsComponent implements OnInit {
  settings: PrefixSettings = {
    itemPrefix: 'ITM-',
    itemNextNumber: 1,
    groupPrefix: 'GRP-',
    groupNextNumber: 1,
    warehousePrefix: 'WH-',
    warehouseNextNumber: 1,
    binPrefix: 'BIN-',
    binNextNumber: 1,
    supplierPrefix: 'SUP-',
    supplierNextNumber: 1,
    unitPrefix: 'UOM-',
    unitNextNumber: 1,
    prPrefix: 'PR-',
    prNextNumber: 1,
    poPrefix: 'PO-',
    poNextNumber: 1,
    grnPrefix: 'GRN-',
    grnNextNumber: 1,
    issuePrefix: 'GI-',
    issueNextNumber: 1,
    transferPrefix: 'ST-',
    transferNextNumber: 1,
    adjustmentPrefix: 'ADJ-',
    adjustmentNextNumber: 1
  };
  
  saving: boolean = false;
  loading: boolean = false;

  constructor(private settingsService: SettingsService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = false;
    this.settingsService.getPrefixSettings().subscribe({
      next: (data) => {
        if (data) {
          this.settings = data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading prefix settings', err);
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.settingsService.savePrefixSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.saving = false;
        this.notificationService.success('Prefix settings saved successfully');
      },
      error: (err) => {
        console.error('Error saving prefix settings', err);
        this.saving = false;
        this.notificationService.error('Error saving prefix settings');
      }
    });
  }

  formatPreview(prefix: string, nextNumber: number): string {
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
}
