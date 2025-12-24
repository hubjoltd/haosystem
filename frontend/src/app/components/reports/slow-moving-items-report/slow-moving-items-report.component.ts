import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-slow-moving-items-report',
  standalone: false,
  templateUrl: './slow-moving-items-report.component.html',
  styleUrls: ['./slow-moving-items-report.component.scss']
})
export class SlowMovingItemsReportComponent implements OnInit {
  reportData: any[] = [];
  groups: ItemGroup[] = [];
  warehouses: Warehouse[] = [];
  
  selectedGroup: string = '';
  selectedWarehouse: string = '';
  daysWithoutMovement: number = 30;
  loading: boolean = false;  // Start with loading
dataReady: boolean = false;  // Only show content when ready
  totalValue: number = 0;
  totalItems: number = 0;

  constructor(
    private itemService: ItemService,
    private itemGroupService: ItemGroupService,
    private warehouseService: WarehouseService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadFilters();
  }

  loadFilters(): void {
    this.itemGroupService.getAll().subscribe({
      next: (data) => this.groups = data,
      error: (err) => console.error('Error loading groups', err)
    });
    
    this.warehouseService.getAllWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: (err) => console.error('Error loading warehouses', err)
    });
  }

  generateReport(): void {
    this.loading = false;
    this.itemService.getAll().subscribe({
      next: (data) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.daysWithoutMovement);

        let filteredData = data.filter((item: any) => {
          const lastMovement = item.lastMovementDate ? new Date(item.lastMovementDate) : null;
          return !lastMovement || lastMovement < cutoffDate;
        });
        
        if (this.selectedGroup) {
          filteredData = filteredData.filter(item => item.group?.name === this.selectedGroup);
        }
        
        if (this.selectedWarehouse) {
          filteredData = filteredData.filter((item: any) => item.warehouse?.name === this.selectedWarehouse);
        }

        this.reportData = filteredData.map((item: any) => ({
          code: item.code,
          name: item.name,
          group: item.group?.name || '',
          warehouse: item.warehouse?.name || 'Default',
          lastMovement: item.lastMovementDate ? new Date(item.lastMovementDate).toLocaleDateString() : 'Never',
          daysIdle: item.lastMovementDate 
            ? Math.floor((new Date().getTime() - new Date(item.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24))
            : 'N/A',
          currentStock: item.currentStock || 0,
          unitCost: item.unitCost || 0,
          value: (item.currentStock || 0) * (item.unitCost || 0)
        }));

        this.totalValue = this.reportData.reduce((sum, r) => sum + r.value, 0);
        this.totalItems = this.reportData.length;
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'slow-moving-items-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'slow-moving-items-report', 'Slow / Non-Moving Items Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'slow-moving-items-report');
  }
  completeLoading(): void {
    this.completeLoading();
    this.dataReady = true;
  }
}
