import { Component, OnInit } from '@angular/core';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-stock-ledger-report',
  standalone: false,
  templateUrl: './stock-ledger-report.component.html',
  styleUrls: ['./stock-ledger-report.component.scss']
})
export class StockLedgerReportComponent implements OnInit {
  reportData: any[] = [];
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = false;

  constructor(private exportService: ExportService) {}

  ngOnInit(): void {}

  generateReport(): void {
    this.loading = true;
    setTimeout(() => {
      this.reportData = [];
      this.loading = false;
    }, 500);
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'stock-ledger-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'stock-ledger-report', 'Stock Ledger Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'stock-ledger-report');
  }
}
