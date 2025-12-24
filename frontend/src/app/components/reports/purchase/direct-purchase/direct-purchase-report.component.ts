import { Component, OnInit } from '@angular/core';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-direct-purchase-report',
  standalone: false,
  templateUrl: './direct-purchase-report.component.html',
  styleUrls: ['./direct-purchase-report.component.scss']
})
export class DirectPurchaseReportComponent implements OnInit {
  reportData: any[] = [];
  loading: boolean = true;  // Start with loading
dataReady: boolean = false;  // Only show content when ready
  fromDate: string = '';
  toDate: string = '';

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
    this.exportService.exportToExcel(this.reportData, 'direct-purchase-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'direct-purchase-report', 'Direct Purchase Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'direct-purchase-report');
  }
  completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
  }
}
