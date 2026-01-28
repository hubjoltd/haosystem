import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { StockMovementService, StockAdjustment } from '../../../services/stock-movement.service';
import { ItemService } from '../../../services/item.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { NotificationService } from '../../../services/notification.service';

interface Adjustment {
  id?: number;
  adjustmentNumber: string;
  adjustmentDate: string;
  adjustmentType: string;
  itemId?: number;
  itemName?: string;
  itemCode?: string;
  warehouseId?: number;
  warehouse?: string;
  binId?: number;
  bin?: string;
  quantityBefore?: number;
  quantityAdjusted: number;
  quantityAfter?: number;
  valueDifference?: number;
  reason: string;
  status: string;
  remarks?: string;
}

@Component({
  selector: 'app-stock-adjustments',
  standalone: false,
  templateUrl: './stock-adjustments.component.html',
  styleUrls: ['./stock-adjustments.component.scss']
})
export class StockAdjustmentsComponent implements OnInit {
  adjustments: Adjustment[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedAdjustment: Adjustment = this.getEmptyAdjustment();
  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string = '';

  items: any[] = [];
  warehouses: any[] = [];
  adjustmentTypes: string[] = ['INCREASE', 'DECREASE'];
  reasons: string[] = [
    'Inventory Count',
    'Damaged Goods',
    'Expired Items',
    'Theft/Loss',
    'Found Items',
    'Return to Stock',
    'Quality Issue',
    'Administrative Correction',
    'Other'
  ];

  constructor(
    private settingsService: SettingsService,
    private stockMovementService: StockMovementService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAdjustments();
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

  loadAdjustments(): void {
    this.loading = true;
    this.stockMovementService.getAllAdjustments().subscribe({
      next: (data: any[]) => {
        this.adjustments = data.map(adj => ({
          id: adj.id,
          adjustmentNumber: adj.adjustmentNumber || '',
          adjustmentDate: adj.adjustmentDate || '',
          adjustmentType: adj.adjustmentType || '',
          itemId: adj.itemId,
          itemName: adj.item || '',
          itemCode: adj.itemCode || '',
          warehouseId: adj.warehouseId,
          warehouse: adj.warehouse || '',
          binId: adj.binId,
          bin: adj.bin || '',
          quantityBefore: adj.quantityBefore || 0,
          quantityAdjusted: adj.quantityAdjusted || 0,
          quantityAfter: adj.quantityAfter || 0,
          valueDifference: adj.valueDifference || 0,
          reason: adj.reason || '',
          status: adj.status || 'Pending',
          remarks: adj.remarks || ''
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading adjustments', err);
        this.adjustments = [];
        this.loading = false;
      }
    });
  }

  getEmptyAdjustment(): Adjustment {
    return {
      adjustmentNumber: '',
      adjustmentDate: new Date().toISOString().split('T')[0],
      adjustmentType: 'INCREASE',
      itemId: undefined,
      itemName: '',
      warehouseId: undefined,
      warehouse: '',
      quantityBefore: 0,
      quantityAdjusted: 0,
      quantityAfter: 0,
      reason: 'Inventory Count',
      status: 'Pending',
      remarks: ''
    };
  }

  openModal(adjustment?: Adjustment) {
    this.errorMessage = '';
    if (adjustment) {
      this.editMode = true;
      this.selectedAdjustment = JSON.parse(JSON.stringify(adjustment));
    } else {
      this.editMode = false;
      this.selectedAdjustment = this.getEmptyAdjustment();
      this.generateAdjustmentNumber();
    }
    this.showModal = true;
  }

  generateAdjustmentNumber(): void {
    this.settingsService.previewPrefixId('adjustment').subscribe({
      next: (adjustmentNumber: string) => {
        this.selectedAdjustment.adjustmentNumber = adjustmentNumber;
      },
      error: (err: any) => console.error('Error generating adjustment number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedAdjustment = this.getEmptyAdjustment();
    this.errorMessage = '';
  }

  onItemSelect(): void {
    const selectedItem = this.items.find(i => i.id === this.selectedAdjustment.itemId);
    if (selectedItem) {
      this.selectedAdjustment.itemName = selectedItem.name;
      this.selectedAdjustment.itemCode = selectedItem.code;
      this.selectedAdjustment.quantityBefore = selectedItem.currentStock || 0;
      this.calculateQuantityAfter();
    }
  }

  calculateQuantityAfter(): void {
    const before = this.selectedAdjustment.quantityBefore || 0;
    const adjusted = this.selectedAdjustment.quantityAdjusted || 0;
    
    if (this.selectedAdjustment.adjustmentType === 'INCREASE') {
      this.selectedAdjustment.quantityAfter = before + adjusted;
    } else {
      this.selectedAdjustment.quantityAfter = before - adjusted;
    }
  }

  saveAdjustment(): void {
    if (!this.selectedAdjustment.itemId) {
      this.notificationService.error('Please select an item.');
      return;
    }

    if (!this.selectedAdjustment.warehouseId) {
      this.notificationService.error('Please select a warehouse.');
      return;
    }

    if (!this.selectedAdjustment.quantityAdjusted || this.selectedAdjustment.quantityAdjusted <= 0) {
      this.notificationService.error('Please enter a valid quantity to adjust.');
      return;
    }

    if (!this.selectedAdjustment.reason) {
      this.notificationService.error('Please select a reason for adjustment.');
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      adjustmentDate: this.selectedAdjustment.adjustmentDate,
      adjustmentType: this.selectedAdjustment.adjustmentType,
      itemId: this.selectedAdjustment.itemId,
      warehouseId: this.selectedAdjustment.warehouseId,
      binId: this.selectedAdjustment.binId,
      quantityAdjusted: this.selectedAdjustment.quantityAdjusted,
      reason: this.selectedAdjustment.reason,
      remarks: this.selectedAdjustment.remarks
    };

    this.stockMovementService.createAdjustment(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success('Stock Adjustment created successfully');
        this.loadAdjustments();
        this.closeModal();
      },
      error: (err: any) => {
        this.saving = false;
        this.notificationService.error(err.error?.error || 'Error saving adjustment');
        console.error('Error saving adjustment', err);
      }
    });
  }

  deleteAdjustment(id: number): void {
    if (confirm('Are you sure you want to delete this adjustment?')) {
      this.stockMovementService.deleteAdjustment(id).subscribe({
        next: () => this.loadAdjustments(),
        error: (err: any) => console.error('Error deleting adjustment', err)
      });
    }
  }

  approveAdjustment(id: number): void {
    if (confirm('Are you sure you want to approve this adjustment? This will update the stock levels.')) {
      this.stockMovementService.approveAdjustment(id).subscribe({
        next: () => {
          this.notificationService.success('Adjustment approved successfully');
          this.loadAdjustments();
        },
        error: (err: any) => {
          console.error('Error approving adjustment', err);
          this.notificationService.error(err.error?.error || 'Error approving adjustment');
        }
      });
    }
  }

  rejectAdjustment(id: number): void {
    if (confirm('Are you sure you want to reject this adjustment?')) {
      this.stockMovementService.rejectAdjustment(id).subscribe({
        next: () => {
          this.notificationService.success('Adjustment rejected');
          this.loadAdjustments();
        },
        error: (err: any) => {
          console.error('Error rejecting adjustment', err);
          this.notificationService.error(err.error?.error || 'Error rejecting adjustment');
        }
      });
    }
  }

  getIncreaseCount(): number {
    return this.adjustments.filter(a => a.adjustmentType === 'INCREASE').length;
  }

  getDecreaseCount(): number {
    return this.adjustments.filter(a => a.adjustmentType === 'DECREASE').length;
  }

  getPendingCount(): number {
    return this.adjustments.filter(a => a.status === 'Pending').length;
  }

  getApprovedCount(): number {
    return this.adjustments.filter(a => a.status === 'Approved' || a.status === 'Completed').length;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Approved': 'badge-success',
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Rejected': 'badge-danger',
      'Draft': 'badge-info'
    };
    return classes[status] || 'badge-info';
  }

  getTypeClass(type: string): string {
    return type === 'INCREASE' ? 'badge-success' : 'badge-danger';
  }
}
