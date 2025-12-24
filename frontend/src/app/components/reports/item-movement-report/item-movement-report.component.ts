import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { InventoryLedgerService, InventoryLedger, LedgerFilter } from '../../../services/inventory-ledger.service';
import { ExportService } from '../../../services/export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-movement-report',
  standalone: false,
  templateUrl: './item-movement-report.component.html',
  styleUrls: ['./item-movement-report.component.scss']
})
export class ItemMovementReportComponent implements OnInit {
  reportData: any[] = [];
  items: Item[] = [];
  warehouses: Warehouse[] = [];
  
  selectedItem: string = '';
  selectedWarehouse: string = '';
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = true;  // Start with loading
dataReady: boolean = false;  // Only show content when ready
  
  totalIn: number = 0;
  totalOut: number = 0;

  constructor(
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private ledgerService: InventoryLedgerService,
    private exportService: ExportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilters();
  }

  loadFilters(): void {
    this.itemService.getAll().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error('Error loading items', err)
    });
    
    this.warehouseService.getAllWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: (err) => console.error('Error loading warehouses', err)
    });
  }

  generateReport(): void {
    if (!this.selectedItem) {
      alert('Please select an item');
      return;
    }
    
    this.loading = true;
    
    const filter: LedgerFilter = {
      itemId: parseInt(this.selectedItem)
    };
    if (this.selectedWarehouse) filter.warehouseId = parseInt(this.selectedWarehouse);
    if (this.fromDate) filter.startDate = this.fromDate;
    if (this.toDate) filter.endDate = this.toDate;
    
    this.ledgerService.getAll(filter).subscribe({
      next: (data: InventoryLedger[]) => {
        this.reportData = data.map(entry => ({
          id: entry.id,
          date: entry.transactionDate,
          documentNo: entry.referenceNumber,
          transactionType: this.formatTransactionType(entry.transactionType),
          warehouse: entry.warehouse?.name || '',
          quantityIn: entry.quantityIn || 0,
          quantityOut: entry.quantityOut || 0,
          balance: entry.balanceQuantity || 0,
          rate: entry.unitValue || 0,
          value: entry.totalValue || 0
        }));
        
        this.totalIn = this.reportData.reduce((sum, r) => sum + r.quantityIn, 0);
        this.totalOut = this.reportData.reduce((sum, r) => sum + r.quantityOut, 0);
        
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  formatTransactionType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'GRN': 'Goods Receipt',
      'GOODS_RECEIPT': 'Goods Receipt',
      'ISSUE': 'Goods Issue',
      'GOODS_ISSUE': 'Goods Issue',
      'TRANSFER': 'Stock Transfer',
      'STOCK_TRANSFER': 'Stock Transfer',
      'ADJUSTMENT': 'Stock Adjustment',
      'STOCK_ADJUSTMENT': 'Stock Adjustment'
    };
    return typeMap[type] || type;
  }

  drillDown(row: any): void {
    const type = row.transactionType;
    let route = '';
    
    if (type.includes('Receipt')) {
      route = '/app/stock-movement/goods-receipt';
    } else if (type.includes('Issue')) {
      route = '/app/stock-movement/goods-issue';
    } else if (type.includes('Transfer')) {
      route = '/app/stock-movement/stock-transfer';
    } else if (type.includes('Adjustment')) {
      route = '/app/stock-movement/stock-adjustments';
    }
    
    if (route) {
      this.router.navigate([route], { queryParams: { referenceNumber: row.documentNo } });
    }
  }

  getSelectedItemName(): string {
    const item = this.items.find(i => i.id?.toString() === this.selectedItem);
    return item ? `${item.code} - ${item.name}` : '';
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'item-movement-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'item-movement-report', 'Item Movement Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'item-movement-report');
  }
  completeLoading(): void {
    this.completeLoading();
    this.dataReady = true;
  }
}
