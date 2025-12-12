import { Component, OnInit } from '@angular/core';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { PRFulfillmentService, PRFulfillment } from '../../../services/pr-fulfillment.service';
import { StockMovementService, GoodsReceipt } from '../../../services/stock-movement.service';
import { ExportService } from '../../../services/export.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

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
  
  totalPOQty: number = 0;
  totalGRNQty: number = 0;
  totalPending: number = 0;

  constructor(
    private supplierService: SupplierService,
    private prFulfillmentService: PRFulfillmentService,
    private stockMovementService: StockMovementService,
    private exportService: ExportService,
    private router: Router
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
    
    forkJoin({
      pos: this.prFulfillmentService.getAllPOs(),
      grns: this.stockMovementService.getAllGRN()
    }).subscribe({
      next: ({ pos, grns }) => {
        const grnByRef = new Map<string, { totalQty: number, grns: GoodsReceipt[] }>();
        
        grns.forEach(grn => {
          const refNumber = grn.referenceNumber || grn.grnNumber || '';
          if (refNumber) {
            if (!grnByRef.has(refNumber)) {
              grnByRef.set(refNumber, { totalQty: 0, grns: [] });
            }
            const entry = grnByRef.get(refNumber)!;
            entry.grns.push(grn);
            entry.totalQty += grn.lines?.reduce((sum: number, line: any) => sum + (line.quantityReceived || line.quantity || 0), 0) || 0;
          }
        });
        
        this.reportData = pos
          .filter((po: PRFulfillment) => po.fulfillmentType === 'PO')
          .map((po: PRFulfillment) => {
          const refNumber = po.referenceNumber || '';
          const grnInfo = grnByRef.get(refNumber) || { totalQty: 0, grns: [] };
          
          const poQty = po.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;
          const grnQty = grnInfo.totalQty;
          const pendingQty = Math.max(0, poQty - grnQty);
          
          let status = 'Pending';
          if (grnQty >= poQty) {
            status = 'Complete';
          } else if (grnQty > 0) {
            status = 'Partial';
          }
          
          return {
            poNumber: refNumber,
            poDate: po.createdAt,
            supplier: po.supplierName || '',
            poQty: poQty,
            grnQty: grnQty,
            pendingQty: pendingQty,
            status: status,
            grnCount: grnInfo.grns.length
          };
        });
        
        if (this.selectedSupplier) {
          this.reportData = this.reportData.filter(r => r.supplier === this.selectedSupplier);
        }
        
        if (this.fromDate) {
          const from = new Date(this.fromDate);
          this.reportData = this.reportData.filter(r => new Date(r.poDate) >= from);
        }
        
        if (this.toDate) {
          const to = new Date(this.toDate);
          this.reportData = this.reportData.filter(r => new Date(r.poDate) <= to);
        }
        
        this.calculateTotals();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.loading = false;
      }
    });
  }

  calculateTotals(): void {
    this.totalPOQty = this.reportData.reduce((sum, r) => sum + r.poQty, 0);
    this.totalGRNQty = this.reportData.reduce((sum, r) => sum + r.grnQty, 0);
    this.totalPending = this.reportData.reduce((sum, r) => sum + r.pendingQty, 0);
  }

  drillDownToPO(row: any): void {
    this.router.navigate(['/app/purchase/pr-fulfillment'], { queryParams: { poNumber: row.poNumber } });
  }

  drillDownToGRN(row: any): void {
    this.router.navigate(['/app/stock-movement/goods-receipt'], { queryParams: { poNumber: row.poNumber } });
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
