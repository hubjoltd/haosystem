import { Component, OnInit } from '@angular/core';
import { PurchaseRequisitionService } from '../../../../services/purchase-requisition.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-pr-list-report',
  standalone: false,
  templateUrl: './pr-list-report.component.html',
  styleUrls: ['./pr-list-report.component.scss']
})
export class PrListReportComponent implements OnInit {
  reportData: any[] = [];
  loading: boolean = false;  // Start with loading state
  dataReady: boolean = false;  // Only show content when ready
  selectedStatus: string = '';
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private prService: PurchaseRequisitionService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    this.loading = true;
    this.prService.getAll().subscribe({
      next: (data) => {
        this.reportData = data.map((pr: any) => ({
          prNumber: pr.prNumber,
          prDate: pr.prDate,
          requiredDate: pr.requiredDate,
          department: pr.department,
          requestedBy: pr.requestedBy,
          status: pr.status,
          itemCount: pr.items?.length || 0,
          totalAmount: pr.totalAmount || 0
        }));

        if (this.selectedStatus) {
          this.reportData = this.reportData.filter(r => r.status === this.selectedStatus);
        }

        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'pr-list-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'pr-list-report', 'Purchase Requisition List Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'pr-list-report');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft': return 'badge-secondary';
      case 'Submitted': return 'badge-info';
      case 'Approved': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      case 'Partially Fulfilled': return 'badge-warning';
      case 'Fully Fulfilled': return 'badge-primary';
      default: return 'badge-secondary';
    }
  }
}
