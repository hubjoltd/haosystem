import { Component, OnInit } from '@angular/core';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { ItemService } from '../../../services/item.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-warehouse-stock-report',
  standalone: false,
  templateUrl: './warehouse-stock-report.component.html',
  styleUrls: ['./warehouse-stock-report.component.scss']
})
export class WarehouseStockReportComponent implements OnInit {
  reportData: any[] = [];
  warehouses: Warehouse[] = [];
  selectedWarehouse: string = '';
  loading: boolean = true;  // Start with loading
dataReady: boolean = false;  // Only show content when ready
  totalValue: number = 0;

  constructor(
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.warehouseService.getAllWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: (err) => console.error('Error loading warehouses', err)
    });
  }

  generateReport(): void {
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: (data) => {
        this.reportData = data.map((item: any) => ({
          warehouse: item.warehouse?.name || 'Default',
          bin: item.bin?.code || '-',
          item: item.name,
          itemCode: item.code,
          quantity: item.currentStock || 0,
          value: (item.currentStock || 0) * (item.unitCost || 0)
        }));

        if (this.selectedWarehouse) {
          this.reportData = this.reportData.filter(r => r.warehouse === this.selectedWarehouse);
        }

        this.totalValue = this.reportData.reduce((sum, r) => sum + r.value, 0);
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'warehouse-stock-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'warehouse-stock-report', 'Warehouse Stock Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'warehouse-stock-report');
  }
  completeLoading(): void {
    this.completeLoading();
    this.dataReady = true;
  }
}
