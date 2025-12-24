import { Component, OnInit } from '@angular/core';
import { InventoryLedgerService, InventoryLedger, LedgerFilter } from '../../../services/inventory-ledger.service';
import { ItemService, Item } from '../../../services/item.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { ExportService } from '../../../services/export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stock-ledger-report',
  standalone: false,
  templateUrl: './stock-ledger-report.component.html',
  styleUrls: ['./stock-ledger-report.component.scss']
})
export class StockLedgerReportComponent implements OnInit {
  reportData: any[] = [];
  items: Item[] = [];
  warehouses: Warehouse[] = [];
  
  selectedItem: string = '';
  selectedWarehouse: string = '';
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = false;  // Start with loading
dataReady: boolean = true;  // Only show content when ready

  constructor(
    private ledgerService: InventoryLedgerService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
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
    this.loading = false;
    
    const filter: LedgerFilter = {};
    if (this.selectedItem) filter.itemId = parseInt(this.selectedItem);
    if (this.selectedWarehouse) filter.warehouseId = parseInt(this.selectedWarehouse);
    if (this.fromDate) filter.startDate = this.fromDate;
    if (this.toDate) filter.endDate = this.toDate;
    
    this.ledgerService.getAll(filter).subscribe({
      next: (data: InventoryLedger[]) => {
        this.reportData = data.map(entry => ({
          id: entry.id,
          date: entry.transactionDate,
          documentNo: entry.referenceNumber,
          transactionType: entry.transactionType,
          itemCode: entry.item?.code || '',
          itemName: entry.item?.name || '',
          warehouse: entry.warehouse?.name || '',
          quantityIn: entry.quantityIn || 0,
          quantityOut: entry.quantityOut || 0,
          balance: entry.balanceQuantity || 0,
          rate: entry.unitValue || 0,
          value: entry.totalValue || 0,
          remarks: entry.remarks || ''
        }));
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  drillDown(row: any): void {
    const type = row.transactionType;
    let route = '';
    
    if (type === 'GRN' || type === 'GOODS_RECEIPT') {
      route = '/app/stock-movement/goods-receipt';
    } else if (type === 'ISSUE' || type === 'GOODS_ISSUE') {
      route = '/app/stock-movement/goods-issue';
    } else if (type === 'TRANSFER' || type === 'STOCK_TRANSFER') {
      route = '/app/stock-movement/stock-transfer';
    } else if (type === 'ADJUSTMENT' || type === 'STOCK_ADJUSTMENT') {
      route = '/app/stock-movement/stock-adjustments';
    }
    
    if (route) {
      this.router.navigate([route], { queryParams: { referenceNumber: row.documentNo } });
    }
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'stock-ledger-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'stock-ledger-report', 'Stock Ledger Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'stock-ledger-report');
  }
  completeLoading(): void {
    this.completeLoading();
    this.dataReady = true;
  }
}
