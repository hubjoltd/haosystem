import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory-valuation-report',
  standalone: false,
  templateUrl: './inventory-valuation-report.component.html',
  styleUrls: ['./inventory-valuation-report.component.scss']
})
export class InventoryValuationReportComponent {
  reportData: any[] = [];
}
