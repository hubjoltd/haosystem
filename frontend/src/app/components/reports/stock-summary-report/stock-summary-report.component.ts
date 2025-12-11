import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-summary-report',
  standalone: false,
  templateUrl: './stock-summary-report.component.html',
  styleUrls: ['./stock-summary-report.component.scss']
})
export class StockSummaryReportComponent {
  reportData: any[] = [];
}
