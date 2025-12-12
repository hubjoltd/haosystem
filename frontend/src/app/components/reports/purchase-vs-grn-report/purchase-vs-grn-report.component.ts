import { Component, OnInit } from '@angular/core';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-purchase-vs-grn-report',
  standalone: false,
  templateUrl: './purchase-vs-grn-report.component.html',
  styleUrls: ['./purchase-vs-grn-report.component.scss']
})
export class PurchaseVsGrnReportComponent implements OnInit {
  reportData: any[] = [];
  suppliers: Supplier[] = [];
  selectedSupplier: string = '';
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = false;

  constructor(
    private supplierService: SupplierService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error('Error loading suppliers', err)
    });
  }

  generateReport(): void {
    this.loading = true;
    setTimeout(() => {
      this.reportData = [];
      this.loading = false;
    }, 500);
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'purchase-vs-grn-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'purchase-vs-grn-report', 'Purchase vs GRN Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'purchase-vs-grn-report');
  }

  getStatusClass(status: string): string {
    if (status === 'Pending') return 'badge-warning';
    if (status === 'Complete') return 'badge-success';
    return 'badge-info';
  }
}
