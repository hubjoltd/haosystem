import { Component, OnInit } from '@angular/core';
import { PRFulfillmentService } from '../../../../services/pr-fulfillment.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-stock-issue-transfer-report',
  standalone: false,
  templateUrl: './stock-issue-transfer-report.component.html',
  styleUrls: ['./stock-issue-transfer-report.component.scss']
})
export class StockIssueTransferReportComponent implements OnInit {
  reportData: any[] = [];
  loading: boolean = true;  // Start with loading
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
    this.loading = true;
    this.fulfillmentService.getAll().subscribe({
      next: (data: any) => {
        this.reportData = data
          .filter((f: any) => {
            if (this.selectedType === 'Stock Issue') {
              return f.fulfillmentType === 'Stock Issue';
            } else if (this.selectedType === 'Material Transfer') {
              return f.fulfillmentType === 'Material Transfer';
            }
            return f.fulfillmentType === 'Stock Issue' || f.fulfillmentType === 'Material Transfer';
          })
          .map((f: any) => ({
            referenceNumber: f.referenceNumber,
            date: f.fulfillmentDate,
            type: f.fulfillmentType,
            prNumber: f.prNumber,
            warehouse: f.warehouseName || '-',
            sourceLocation: f.sourceLocation || '-',
            targetLocation: f.targetLocation || '-',
            performedBy: f.performedBy,
            itemCount: f.items?.length || 0
          }));

        this.completeLoading();
      },
      error: (err: any) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'stock-issue-transfer-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'stock-issue-transfer-report', 'Stock Issue / Transfer Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'stock-issue-transfer-report');
  }

  getTypeClass(type: string): string {
    return type === 'Stock Issue' ? 'badge-success' : 'badge-info';
  }
  completeLoading(): void {
    this.completeLoading();
    this.dataReady = true;
  }
}
