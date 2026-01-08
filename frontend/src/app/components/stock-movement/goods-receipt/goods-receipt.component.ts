import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { StockMovementService, GoodsReceipt, GRNLine } from '../../../services/stock-movement.service';
import { ItemService } from '../../../services/item.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { SupplierService } from '../../../services/supplier.service';
import { PRFulfillmentService, PRFulfillment } from '../../../services/pr-fulfillment.service';
import { NotificationService } from '../../../services/notification.service';

interface GRNItem {
  itemId?: number;
  itemName: string;
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  binId?: number;
}

interface GRN {
  id?: number;
  grnNumber: string;
  receiptDate: string;
  receiptType: string;
  poNumber?: string;
  supplierId?: number;
  supplier?: string;
  warehouseId?: number;
  warehouse?: string;
  referenceNumber?: string;
  items: GRNItem[];
  totalQty: number;
  totalValue: number;
  status: string;
  remarks?: string;
}

@Component({
  selector: 'app-goods-receipt',
  standalone: false,
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.scss']
})
export class GoodsReceiptComponent implements OnInit {
  grnList: GRN[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedGRN: GRN = this.getEmptyGRN();
  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string = '';

  items: any[] = [];
  warehouses: any[] = [];
  suppliers: any[] = [];
  purchaseOrders: PRFulfillment[] = [];
  selectedPOId: number | null = null;

  constructor(
    private settingsService: SettingsService,
    private stockMovementService: StockMovementService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private supplierService: SupplierService,
    private prFulfillmentService: PRFulfillmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGRNs();
    this.loadMasterData();
  }

  loadMasterData(): void {
    this.itemService.getAll().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error('Error loading items', err)
    });
    this.warehouseService.getAll().subscribe({
      next: (data: any[]) => this.warehouses = data,
      error: (err: any) => console.error('Error loading warehouses', err)
    });
    this.supplierService.getAll().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error('Error loading suppliers', err)
    });
    this.prFulfillmentService.getAllPOs().subscribe({
      next: (data) => this.purchaseOrders = data,
      error: (err) => console.error('Error loading POs', err)
    });
  }

  loadGRNs(): void {
    this.loading = true;
    this.stockMovementService.getAllGRN().subscribe({
      next: (data) => {
        this.grnList = data.map((grn: any) => ({
          id: grn.id,
          grnNumber: grn.grnNumber || '',
          receiptDate: grn.receiptDate || '',
          receiptType: grn.receiptType || 'DIRECT',
          poNumber: grn.poNumber || '',
          supplierId: grn.supplierId,
          supplier: grn.supplier || '',
          warehouseId: grn.warehouseId,
          warehouse: grn.warehouse || '',
          referenceNumber: grn.referenceNumber || '',
          totalQty: grn.lines?.reduce((sum: number, line: any) => sum + (line.quantity || 0), 0) || 0,
          totalValue: grn.totalValue || 0,
          status: grn.status || 'Completed',
          remarks: grn.remarks || '',
          items: grn.lines?.map((line: any) => ({
            itemId: line.itemId,
            itemName: line.itemName || '',
            itemCode: line.itemCode || '',
            description: '',
            quantity: line.quantity || 0,
            unitPrice: line.unitPrice || 0,
            amount: line.lineTotal || 0
          })) || []
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading GRNs', err);
        this.grnList = [];
        this.loading = false;
      }
    });
  }

  getEmptyGRN(): GRN {
    return {
      grnNumber: '',
      receiptDate: new Date().toISOString().split('T')[0],
      receiptType: 'DIRECT',
      poNumber: '',
      supplierId: undefined,
      supplier: '',
      warehouseId: undefined,
      warehouse: '',
      referenceNumber: '',
      items: [],
      totalQty: 0,
      totalValue: 0,
      status: 'Draft',
      remarks: ''
    };
  }

  getEmptyItem(): GRNItem {
    return {
      itemId: undefined,
      itemName: '',
      itemCode: '',
      description: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0
    };
  }

  openModal(grn?: GRN) {
    this.errorMessage = '';
    this.selectedPOId = null;
    if (grn) {
      this.editMode = true;
      this.selectedGRN = JSON.parse(JSON.stringify(grn));
    } else {
      this.editMode = false;
      this.selectedGRN = this.getEmptyGRN();
      this.generateGRNNumber();
      this.addItem();
    }
    this.showModal = true;
  }

  onReceiptTypeChange(): void {
    if (this.selectedGRN.receiptType === 'DIRECT') {
      this.selectedPOId = null;
      this.selectedGRN.poNumber = '';
      this.selectedGRN.items = [];
      this.addItem();
    }
  }

  onPOSelect(): void {
    if (!this.selectedPOId) return;
    
    const selectedPO = this.purchaseOrders.find(po => po.id === this.selectedPOId);
    if (selectedPO) {
      this.selectedGRN.poNumber = selectedPO.referenceNumber;
      this.selectedGRN.supplierId = selectedPO.supplierId;
      this.errorMessage = '';
      
      if (selectedPO.warehouseId) {
        this.selectedGRN.warehouseId = selectedPO.warehouseId;
      }
      
      this.selectedGRN.items = (selectedPO.items || [])
        .filter(item => item.itemId && item.fulfillQty && item.fulfillQty > 0)
        .map(item => ({
          itemId: item.itemId,
          itemName: item.itemName || '',
          itemCode: item.itemCode || '',
          description: item.itemDescription || '',
          quantity: item.fulfillQty || 0,
          unitPrice: item.rate || 0,
          amount: (item.fulfillQty || 0) * (item.rate || 0)
        }));
      
      this.calculateTotals();
    }
  }

  getPOsWithItems(): PRFulfillment[] {
    return this.purchaseOrders.filter(po => {
      if (!po.items || po.items.length === 0) return false;
      const validItems = po.items.filter(item => item.itemId && item.fulfillQty && item.fulfillQty > 0);
      return validItems.length > 0;
    });
  }

  generateGRNNumber(): void {
    this.settingsService.generatePrefixId('grn').subscribe({
      next: (grnNumber) => {
        this.selectedGRN.grnNumber = grnNumber;
      },
      error: (err) => console.error('Error generating GRN number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedGRN = this.getEmptyGRN();
    this.errorMessage = '';
  }

  addItem(): void {
    this.selectedGRN.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedGRN.items.length > 1) {
      this.selectedGRN.items.splice(index, 1);
      this.calculateTotals();
    }
  }

  onItemSelect(index: number): void {
    const selectedItem = this.items.find(i => i.id === this.selectedGRN.items[index].itemId);
    if (selectedItem) {
      this.selectedGRN.items[index].itemName = selectedItem.name;
      this.selectedGRN.items[index].itemCode = selectedItem.code;
      this.selectedGRN.items[index].description = selectedItem.description || '';
      this.selectedGRN.items[index].unitPrice = selectedItem.unitCost || 0;
      this.calculateItemAmount(this.selectedGRN.items[index]);
    }
  }

  calculateItemAmount(item: GRNItem): void {
    item.amount = item.quantity * item.unitPrice;
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.selectedGRN.totalQty = this.selectedGRN.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    this.selectedGRN.totalValue = this.selectedGRN.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  saveGRN(): void {
    this.calculateTotals();
    
    const validItems = this.selectedGRN.items.filter(item => item.itemId && item.quantity > 0);
    if (validItems.length === 0) {
      this.notificationService.error('Please add at least one item with quantity.');
      return;
    }

    if (!this.selectedGRN.warehouseId) {
      this.notificationService.error('Please select a warehouse.');
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      receiptDate: this.selectedGRN.receiptDate,
      receiptType: this.selectedGRN.receiptType,
      poNumber: this.selectedGRN.poNumber,
      supplierId: this.selectedGRN.supplierId,
      warehouseId: this.selectedGRN.warehouseId,
      referenceNumber: this.selectedGRN.referenceNumber,
      remarks: this.selectedGRN.remarks,
      lines: validItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        binId: item.binId
      }))
    };

    this.stockMovementService.createGRN(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success('Goods Receipt created successfully');
        this.loadGRNs();
        this.closeModal();
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.error(err.error?.error || 'Error saving GRN');
        console.error('Error saving GRN', err);
      }
    });
  }

  deleteGRN(id: number): void {
    if (confirm('Are you sure you want to delete this GRN?')) {
      this.stockMovementService.deleteGRN(id).subscribe({
        next: () => this.loadGRNs(),
        error: (err) => console.error('Error deleting GRN', err)
      });
    }
  }

  getTotalValue(): number {
    return this.grnList.reduce((sum, grn) => sum + (grn.totalValue || 0), 0);
  }

  getCompletedCount(): number {
    return this.grnList.filter(grn => grn.status === 'Completed').length;
  }

  getPendingCount(): number {
    return this.grnList.filter(grn => grn.status === 'Pending' || grn.status === 'Draft').length;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Draft': 'badge-info'
    };
    return classes[status] || 'badge-info';
  }
}
