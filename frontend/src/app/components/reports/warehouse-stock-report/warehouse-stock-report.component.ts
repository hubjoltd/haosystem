import { Component } from '@angular/core';

@Component({
  selector: 'app-warehouse-stock-report',
  standalone: false,
  templateUrl: './warehouse-stock-report.component.html',
  styleUrls: ['./warehouse-stock-report.component.scss']
})
export class WarehouseStockReportComponent {
  reportData: any[] = [];
}
