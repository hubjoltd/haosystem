import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { StockMovementService, StockTransfer, StockTransferLine } from '../../../services/stock-movement.service';
import { ItemService } from '../../../services/item.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { NotificationService } from '../../../services/notification.service';

interface TransferItem {
  itemId?: number;
  itemName: string;
  itemCode?: string;
  description: string;
  quantity: number;
  fromBinId?: number;
  toBinId?: number;
}

interface Transfer {
  id?: number;
  transferNumber: string;
  transferDate: string;
  fromWarehouseId?: number;
  fromWarehouse?: string;
  toWarehouseId?: number;
  toWarehouse?: string;
  items: TransferItem[];
  totalQty: number;
  status: string;
  remarks?: string;
}

@Component({
  selector: 'app-stock-transfer',
  standalone: false,
  templateUrl: './stock-transfer.component.html',
  styleUrls: ['./stock-transfer.component.scss']
})
export class StockTransferComponent implements OnInit {
  transferList: Transfer[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedTransfer: Transfer = this.getEmptyTransfer();
  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string = '';

  items: any[] = [];
  warehouses: any[] = [];

  constructor(
    private settingsService: SettingsService,
    private stockMovementService: StockMovementService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTransfers();
    this.loadMasterData();
  }

  loadMasterData(): void {
    this.itemService.getAll().subscribe({
      next: (data: any[]) => this.items = data,
      error: (err: any) => console.error('Error loading items', err)
    });
    this.warehouseService.getAll().subscribe({
      next: (data: any[]) => this.warehouses = data,
      error: (err: any) => console.error('Error loading warehouses', err)
    });
  }

  loadTransfers(): void {
    this.loading = true;
    this.stockMovementService.getAllTransfers().subscribe({
      next: (data: any[]) => {
        this.transferList = data.map(transfer => ({
          id: transfer.id,
          transferNumber: transfer.transferNumber || '',
          transferDate: transfer.transferDate || '',
          fromWarehouseId: transfer.fromWarehouseId,
          fromWarehouse: transfer.fromWarehouse || '',
          toWarehouseId: transfer.toWarehouseId,
          toWarehouse: transfer.toWarehouse || '',
          totalQty: transfer.lines?.reduce((sum: number, line: any) => sum + (line.quantity || 0), 0) || 0,
          status: transfer.status || 'Completed',
          remarks: transfer.remarks || '',
          items: transfer.lines?.map((line: any) => ({
            itemId: line.itemId,
            itemName: line.itemName || '',
            itemCode: line.itemCode || '',
            description: '',
            quantity: line.quantity || 0,
            fromBinId: line.fromBinId,
            toBinId: line.toBinId
          })) || []
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading transfers', err);
        this.transferList = [];
        this.loading = false;
      }
    });
  }

  getEmptyTransfer(): Transfer {
    return {
      transferNumber: '',
      transferDate: new Date().toISOString().split('T')[0],
      fromWarehouseId: undefined,
      fromWarehouse: '',
      toWarehouseId: undefined,
      toWarehouse: '',
      items: [],
      totalQty: 0,
      status: 'Draft',
      remarks: ''
    };
  }

  getEmptyItem(): TransferItem {
    return {
      itemId: undefined,
      itemName: '',
      itemCode: '',
      description: '',
      quantity: 0
    };
  }

  openModal(transfer?: Transfer) {
    this.errorMessage = '';
    if (transfer) {
      this.editMode = true;
      this.selectedTransfer = JSON.parse(JSON.stringify(transfer));
    } else {
      this.editMode = false;
      this.selectedTransfer = this.getEmptyTransfer();
      this.generateTransferNumber();
      this.addItem();
    }
    this.showModal = true;
  }

  generateTransferNumber(): void {
    this.settingsService.generatePrefixId('transfer').subscribe({
      next: (transferNumber: string) => {
        this.selectedTransfer.transferNumber = transferNumber;
      },
      error: (err: any) => console.error('Error generating transfer number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedTransfer = this.getEmptyTransfer();
    this.errorMessage = '';
  }

  addItem(): void {
    this.selectedTransfer.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedTransfer.items.length > 1) {
      this.selectedTransfer.items.splice(index, 1);
      this.calculateTotals();
    }
  }

  onItemSelect(index: number): void {
    const selectedItem = this.items.find(i => i.id === this.selectedTransfer.items[index].itemId);
    if (selectedItem) {
      this.selectedTransfer.items[index].itemName = selectedItem.name;
      this.selectedTransfer.items[index].itemCode = selectedItem.code;
      this.selectedTransfer.items[index].description = selectedItem.description || '';
    }
  }

  calculateTotals(): void {
    this.selectedTransfer.totalQty = this.selectedTransfer.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  saveTransfer(): void {
    this.calculateTotals();
    
    const validItems = this.selectedTransfer.items.filter(item => item.itemId && item.quantity > 0);
    if (validItems.length === 0) {
      this.notificationService.error('Please add at least one item with quantity.');
      return;
    }

    if (!this.selectedTransfer.fromWarehouseId) {
      this.notificationService.error('Please select a source warehouse.');
      return;
    }

    if (!this.selectedTransfer.toWarehouseId) {
      this.notificationService.error('Please select a destination warehouse.');
      return;
    }

    if (this.selectedTransfer.fromWarehouseId === this.selectedTransfer.toWarehouseId) {
      this.notificationService.error('Source and destination warehouse cannot be the same.');
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      transferDate: this.selectedTransfer.transferDate,
      fromWarehouseId: this.selectedTransfer.fromWarehouseId,
      toWarehouseId: this.selectedTransfer.toWarehouseId,
      remarks: this.selectedTransfer.remarks,
      lines: validItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        fromBinId: item.fromBinId,
        toBinId: item.toBinId
      }))
    };

    this.stockMovementService.createTransfer(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success('Stock Transfer created successfully');
        this.loadTransfers();
        this.closeModal();
      },
      error: (err: any) => {
        this.saving = false;
        this.notificationService.error(err.error?.error || 'Error saving transfer');
        console.error('Error saving transfer', err);
      }
    });
  }

  deleteTransfer(id: number): void {
    if (confirm('Are you sure you want to delete this transfer?')) {
      this.stockMovementService.deleteTransfer(id).subscribe({
        next: () => this.loadTransfers(),
        error: (err: any) => console.error('Error deleting transfer', err)
      });
    }
  }

  getCompletedCount(): number {
    return this.transferList.filter(t => t.status === 'Completed').length;
  }

  getInTransitCount(): number {
    return this.transferList.filter(t => t.status === 'In Transit').length;
  }

  getPendingCount(): number {
    return this.transferList.filter(t => t.status === 'Pending' || t.status === 'Draft').length;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Completed': 'badge-success',
      'In Transit': 'badge-info',
      'Pending': 'badge-warning',
      'Draft': 'badge-secondary'
    };
    return classes[status] || 'badge-info';
  }
}
