import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { InventoryLedgerService, InventoryLedger, LedgerFilter } from '../../../services/inventory-ledger.service';
import { ExportService } from '../../../services/export.service';
import { forkJoin } from 'rxjs';

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
  suppliers: Supplier[] = [];
  
  selectedWarehouse: string = '';
  selectedGroup: string = '';
  selectedSupplier: string = '';
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = false;
  
  totalOpening: number = 0;
  totalIn: number = 0;
  totalOut: number = 0;
  totalClosing: number = 0;

  constructor(
    private itemService: ItemService,
    private itemGroupService: ItemGroupService,
    private warehouseService: WarehouseService,
    private supplierService: SupplierService,
    private ledgerService: InventoryLedgerService,
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
    
    this.supplierService.getAll().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error('Error loading suppliers', err)
    });
  }

  generateReport(): void {
    this.loading = true;
    
    forkJoin({
      items: this.itemService.getAll(),
      ledger: this.ledgerService.getAll({
        warehouseId: this.selectedWarehouse ? parseInt(this.selectedWarehouse) : undefined,
        startDate: this.fromDate || undefined,
        endDate: this.toDate || undefined
      })
    }).subscribe({
      next: ({ items, ledger }) => {
        let filteredItems = items;
        
        if (this.selectedGroup) {
          filteredItems = filteredItems.filter(item => item.group?.name === this.selectedGroup);
        }
        
        if (this.selectedSupplier) {
          filteredItems = filteredItems.filter(item => 
            item.supplier?.name === this.selectedSupplier
          );
        }
        
        const itemMovements = new Map<number, { stockIn: number, stockOut: number }>();
        
        ledger.forEach((entry: InventoryLedger) => {
          const itemId = entry.item?.id;
          if (itemId) {
            if (!itemMovements.has(itemId)) {
              itemMovements.set(itemId, { stockIn: 0, stockOut: 0 });
            }
            const current = itemMovements.get(itemId)!;
            current.stockIn += entry.quantityIn || 0;
            current.stockOut += entry.quantityOut || 0;
          }
        });
        
        this.reportData = filteredItems.map(item => {
          const movements = itemMovements.get(item.id!) || { stockIn: 0, stockOut: 0 };
          const closing = item.currentStock || 0;
          const opening = closing - movements.stockIn + movements.stockOut;
          
          return {
            code: item.code,
            name: item.name,
            group: item.group?.name || '',
            unit: item.unitOfMeasure?.name || '',
            supplier: item.supplier?.name || '',
            opening: Math.max(0, opening),
            stockIn: movements.stockIn,
            stockOut: movements.stockOut,
            closing: closing,
            unitCost: item.unitCost || 0,
            value: closing * (item.unitCost || 0)
          };
        });
        
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
    this.totalOpening = this.reportData.reduce((sum, r) => sum + r.opening, 0);
    this.totalIn = this.reportData.reduce((sum, r) => sum + r.stockIn, 0);
    this.totalOut = this.reportData.reduce((sum, r) => sum + r.stockOut, 0);
    this.totalClosing = this.reportData.reduce((sum, r) => sum + r.closing, 0);
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
