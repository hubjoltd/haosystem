import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryLedgerService, InventoryLedger, LedgerFilter } from '../../../services/inventory-ledger.service';
import { ItemService, Item } from '../../../services/item.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';

@Component({
  selector: 'app-inventory-ledger',
  standalone: false,
  templateUrl: './inventory-ledger.component.html',
  styleUrls: ['./inventory-ledger.component.scss']
})
export class InventoryLedgerComponent implements OnInit {
  ledgerEntries: InventoryLedger[] = [];
  items: Item[] = [];
  warehouses: Warehouse[] = [];
  loading = false;

  selectedItemId: number | null = null;
  selectedWarehouseId: number | null = null;
  dateFrom: string = '';
  dateTo: string = '';

  constructor(
    private ledgerService: InventoryLedgerService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadWarehouses();
    this.loadLedger();
  }

  loadItems(): void {
    this.itemService.getAll().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error('Error loading items', err)
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getAll().subscribe({
      next: (data) => this.warehouses = data,
      error: (err) => console.error('Error loading warehouses', err)
    });
  }

  loadLedger(): void {
    this.loading = true;
    const filter: LedgerFilter = {};
    if (this.selectedItemId) filter.itemId = this.selectedItemId;
    if (this.selectedWarehouseId) filter.warehouseId = this.selectedWarehouseId;
    if (this.dateFrom) filter.startDate = this.dateFrom;
    if (this.dateTo) filter.endDate = this.dateTo;

    this.ledgerService.getAll(filter).subscribe({
      next: (data) => {
        this.ledgerEntries = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading ledger', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.loadLedger();
  }

  clearFilters(): void {
    this.selectedItemId = null;
    this.selectedWarehouseId = null;
    this.dateFrom = '';
    this.dateTo = '';
    this.loadLedger();
  }

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'GOODS_RECEIPT': 'badge-success',
      'GOODS_ISSUE': 'badge-danger',
      'TRANSFER_IN': 'badge-info',
      'TRANSFER_OUT': 'badge-warning',
      'ADJUSTMENT': 'badge-secondary'
    };
    return classes[type] || 'badge-info';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'GOODS_RECEIPT': 'Goods Receipt',
      'GOODS_ISSUE': 'Goods Issue',
      'TRANSFER_IN': 'Transfer In',
      'TRANSFER_OUT': 'Transfer Out',
      'ADJUSTMENT': 'Adjustment'
    };
    return labels[type] || type;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatCurrency(value: number): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  drillDown(entry: InventoryLedger): void {
    const refNo = entry.referenceNumber;
    if (!refNo) return;

    const queryParams = { search: refNo };

    if (refNo.startsWith('GRN')) {
      this.router.navigate(['/app/stock/grn'], { queryParams });
    } else if (refNo.startsWith('ISS') || refNo.startsWith('GI')) {
      this.router.navigate(['/app/stock/issue'], { queryParams });
    } else if (refNo.startsWith('TRF') || refNo.startsWith('ST')) {
      this.router.navigate(['/app/stock/transfer'], { queryParams });
    } else if (refNo.startsWith('ADJ') || refNo.startsWith('SA')) {
      this.router.navigate(['/app/stock/adjustment'], { queryParams });
    }
  }

  exportLedger(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['Date', 'Document No', 'Item', 'Transaction Type', 'In Qty', 'Out Qty', 'Balance Qty', 'Rate', 'Value', 'Warehouse', 'Remarks'];
    const rows = this.ledgerEntries.map(e => [
      this.formatDate(e.transactionDate),
      e.referenceNumber,
      e.item?.name || '-',
      this.getTypeLabel(e.transactionType),
      e.quantityIn || 0,
      e.quantityOut || 0,
      e.balanceQuantity || 0,
      e.unitValue || 0,
      e.totalValue || 0,
      e.warehouse?.name || '-',
      e.remarks || ''
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
