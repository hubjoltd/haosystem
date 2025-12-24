import { Component, OnInit } from '@angular/core';
import { PRFulfillmentService } from '../../../../services/pr-fulfillment.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-pr-history-report',
  standalone: false,
  templateUrl: './pr-history-report.component.html',
  styleUrls: ['./pr-history-report.component.scss']
})
export class PrHistoryReportComponent implements OnInit {
  reportData: any[] = [];
  loading: boolean = false;  // Start with loading
dataReady: boolean = false;  // Only show content when ready
  selectedType: string = '';
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private fulfillmentService: PRFulfillmentService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {}

  generateReport(): void {
    this.loading = false;
    this.fulfillmentService.getAll().subscribe({
      next: (data) => {
        this.reportData = data.map((f: any) => ({
          referenceNumber: f.referenceNumber,
          prNumber: f.prNumber,
          fulfillmentDate: f.fulfillmentDate,
          fulfillmentType: f.fulfillmentType,
          performedBy: f.performedBy,
          supplierName: f.supplierName || '-',
          warehouseName: f.warehouseName || '-',
          itemCount: f.items?.length || 0,
          totalAmount: f.totalAmount || 0
        }));

        if (this.selectedType) {
          this.reportData = this.reportData.filter(r => r.fulfillmentType === this.selectedType);
        }

        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'pr-fulfillment-history-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'pr-fulfillment-history-report', 'PR Fulfillment History Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'pr-fulfillment-history-report');
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Convert to PO': return 'badge-primary';
      case 'Stock Issue': return 'badge-success';
      case 'Material Transfer': return 'badge-info';
      default: return 'badge-secondary';
    }
  }
  completeLoading(): void {
    this.completeLoading();
    this.dataReady = true;
  }
}
