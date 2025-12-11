import { Component } from '@angular/core';

@Component({
  selector: 'app-contract-settings',
  standalone: false,
  templateUrl: './contract-settings.component.html',
  styleUrls: ['./contract-settings.component.scss']
})
export class ContractSettingsComponent {
  contractTypes = [
    { id: 1, name: 'Service Agreement', duration: 12, renewable: true },
    { id: 2, name: 'Maintenance Contract', duration: 6, renewable: true },
    { id: 3, name: 'One-time Project', duration: 3, renewable: false },
    { id: 4, name: 'Annual Subscription', duration: 12, renewable: true }
  ];

  contractStatuses = [
    { id: 1, name: 'Draft', color: '#6c757d' },
    { id: 2, name: 'Active', color: '#28a745' },
    { id: 3, name: 'Expired', color: '#dc3545' },
    { id: 4, name: 'Pending Renewal', color: '#ffc107' }
  ];

  showModal: boolean = false;
}
