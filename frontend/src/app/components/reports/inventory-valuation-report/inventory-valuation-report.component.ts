import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { SettingsService, GeneralSettings } from '../../../services/settings.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-inventory-valuation-report',
  standalone: false,
  templateUrl: './inventory-valuation-report.component.html',
  styleUrls: ['./inventory-valuation-report.component.scss']
})
export class InventoryValuationReportComponent implements OnInit {
  reportData: any[] = [];
  items: Item[] = [];
  groups: ItemGroup[] = [];
  warehouses: Warehouse[] = [];
  
  selectedGroup: string = '';
  selectedWarehouse: string = '';
  totalValue: number = 0;
  loading: boolean = false;  // Start with loading
dataReady: boolean = true;  // Only show content when ready
  valuationMethod: string = 'FIFO';
  asOfDate: string = '';

  constructor(
    private itemService: ItemService,
    private itemGroupService: ItemGroupService,
    private warehouseService: WarehouseService,
    private settingsService: SettingsService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadValuationMethod();
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

  loadValuationMethod(): void {
    this.settingsService.getGeneralSettings().subscribe({
      next: (settings: GeneralSettings) => {
        this.valuationMethod = settings.valuationMethod || 'FIFO';
      },
      error: (err) => {
        console.error('Error loading valuation method', err);
        this.valuationMethod = 'FIFO';
      }
    });
  }

  generateReport(): void {
    this.loading = false;
    this.itemService.getAll().subscribe({
      next: (data) => {
        let filteredData = data;
        
        if (this.selectedGroup) {
          filteredData = filteredData.filter(item => item.group?.name === this.selectedGroup);
        }
        
        this.reportData = filteredData.map(item => {
          const quantity = item.currentStock || 0;
          const unitCost = item.unitCost || 0;
          const totalValue = quantity * unitCost;
          
          return {
            code: item.code,
            name: item.name,
            group: item.group?.name || '',
            unit: item.unitOfMeasure?.name || '',
            quantity: quantity,
            unitCost: unitCost,
            totalValue: totalValue,
            valuationMethod: this.getValuationMethodDisplay()
          };
        });
        
        this.totalValue = this.reportData.reduce((sum, item) => sum + item.totalValue, 0);
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  getValuationMethodDisplay(): string {
    const methodMap: { [key: string]: string } = {
      'FIFO': 'First In, First Out',
      'LIFO': 'Last In, First Out',
      'WEIGHTED_AVERAGE': 'Weighted Average'
    };
    return methodMap[this.valuationMethod] || this.valuationMethod;
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'inventory-valuation-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'inventory-valuation-report', 
      `Inventory Valuation Report (${this.getValuationMethodDisplay()})`);
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'inventory-valuation-report');
  }
  completeLoading(): void {
    this.completeLoading();
    this.dataReady = true;
  }
}
