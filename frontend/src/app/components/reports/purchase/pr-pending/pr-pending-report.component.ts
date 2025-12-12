import { Component, OnInit } from '@angular/core';
import { PurchaseRequisitionService } from '../../../../services/purchase-requisition.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-pr-pending-report',
  standalone: false,
  templateUrl: './pr-pending-report.component.html',
  styleUrls: ['./pr-pending-report.component.scss']
})
export class PrPendingReportComponent implements OnInit {
  reportData: any[] = [];
  loading: boolean = false;

  constructor(
    private prService: PurchaseRequisitionService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {}

  generateReport(): void {
    this.loading = true;
    this.prService.getAll().subscribe({
      next: (data) => {
        const pendingItems: any[] = [];
        
        data.forEach(pr => {
          if (pr.status === 'Approved' || pr.status === 'Partially Fulfilled') {
            pr.items?.forEach((item: any) => {
              const pending = (item.quantity || 0) - (item.fulfilledQuantity || 0);
              if (pending > 0) {
                pendingItems.push({
                  prNumber: pr.prNumber,
                  prDate: pr.prDate,
                  itemName: item.itemName,
                  itemCode: item.itemCode,
                  requestedQty: item.quantity || 0,
                  fulfilledQty: item.fulfilledQuantity || 0,
                  pendingQty: pending,
                  unit: item.unit || '',
                  department: pr.department
                });
              }
            });
          }
        });

        this.reportData = pendingItems;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'pr-pending-items-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'pr-pending-items-report', 'PR Item Pending Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'pr-pending-items-report');
  }
}
