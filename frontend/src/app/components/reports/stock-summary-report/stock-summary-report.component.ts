import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-stock-summary-report',
  standalone: false,
  templateUrl: './stock-summary-report.component.html',
  styleUrls: ['./stock-summary-report.component.scss']
})
export class StockSummaryReportComponent implements OnInit {
  reportData: any[] = [];
  items: Item[] = [];
  groups: ItemGroup[] = [];
  warehouses: Warehouse[] = [];
  
  selectedWarehouse: string = '';
  selectedGroup: string = '';
  loading: boolean = false;

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
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: (data) => {
        let filteredData = data;
        
        if (this.selectedGroup) {
          filteredData = filteredData.filter(item => item.groupName === this.selectedGroup);
        }
        
        this.reportData = filteredData.map(item => ({
          code: item.code,
          name: item.name,
          group: item.groupName,
          unit: item.unit,
          opening: 0,
          stockIn: 0,
          stockOut: 0,
          closing: item.currentStock || 0
        }));
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'stock-summary-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'stock-summary-report', 'Stock Summary Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'stock-summary-report');
  }
}
