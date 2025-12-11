import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-ledger-report',
  standalone: false,
  templateUrl: './stock-ledger-report.component.html',
  styleUrls: ['./stock-ledger-report.component.scss']
})
export class StockLedgerReportComponent {
  reportData: any[] = [];
}
