import { Component, OnInit } from '@angular/core';
import { PRFulfillmentService } from '../../../../services/pr-fulfillment.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-po-list-report',
  standalone: false,
  templateUrl: './po-list-report.component.html',
  styleUrls: ['./po-list-report.component.scss']
})
export class PoListReportComponent implements OnInit {
  reportData: any[] = [];
  loading: boolean = true;  // Start with loading
dataReady: boolean = false;  // Only show content when ready
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private fulfillmentService: PRFulfillmentService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {}

  generateReport(): void {
    this.loading = true;
    this.fulfillmentService.getAll().subscribe({
      next: (data: any) => {
        this.reportData = data
          .filter((f: any) => f.fulfillmentType === 'Convert to PO' || f.fulfillmentType === 'PO')
          .map((f: any) => ({
            poNumber: f.referenceNumber,
            poDate: f.fulfillmentDate,
            prNumber: f.prNumber,
            supplierName: f.supplierName || '-',
            expectedDelivery: f.expectedDeliveryDate || '-',
            itemCount: f.items?.length || 0,
            totalAmount: f.totalAmount || 0,
            status: 'Created'
          }));

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error generating report', err);
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'po-list-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'po-list-report', 'Purchase Order List Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'po-list-report');
  }
  completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
  }
}
