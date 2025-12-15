import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseRequisitionService, PurchaseRequisition, PRItem, PRStatus, StockFulfillment, StockFulfillmentItem, MaterialTransfer, MaterialTransferItem } from '../../../services/purchase-requisition.service';
import { UnitOfMeasureService, UnitOfMeasure } from '../../../services/unit-of-measure.service';
import { ItemService, Item } from '../../../services/item.service';
import { SettingsService } from '../../../services/settings.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { SupplierService, Supplier } from '../../../services/supplier.service';

interface SelectablePRItem extends PRItem {
  selected?: boolean;
  fulfillQty?: number;
}

@Component({
  selector: 'app-purchase-requisition',
  standalone: false,
  templateUrl: './purchase-requisition.component.html',
  styleUrls: ['./purchase-requisition.component.scss']
})
export class PurchaseRequisitionComponent implements OnInit {
  requisitions: PurchaseRequisition[] = [];
  draftPRs: PurchaseRequisition[] = [];
  submittedPRs: PurchaseRequisition[] = [];
  approvedPRs: PurchaseRequisition[] = [];
  partiallyFulfilledPRs: PurchaseRequisition[] = [];
  fullyFulfilledPRs: PurchaseRequisition[] = [];
  rejectedPRs: PurchaseRequisition[] = [];
  
  isAdmin = true;
  
  units: UnitOfMeasure[] = [];
  items: Item[] = [];
  warehouses: Warehouse[] = [];
  suppliers: Supplier[] = [];
  
  showModal = false;
  isEditing = false;
  searchTerm = '';
  viewMode: 'kanban' | 'table' = 'kanban';
  
  selectedPR: PurchaseRequisition = this.getEmptyPR();
  
  showViewModal = false;
  viewTabActive: 'purchaseOrders' | 'stockFulfillments' | 'materialTransfers' = 'purchaseOrders';
  purchaseOrders: any[] = [];
  stockFulfillments: StockFulfillment[] = [];
  materialTransfers: MaterialTransfer[] = [];
  
  showStockFulfillmentModal = false;
  stockFulfillmentItems: SelectablePRItem[] = [];
  selectedWarehouseId: number | null = null;
  selectedSupplierId: number | null = null;
  stockFulfillmentRemarks = '';
  
  showMaterialTransferModal = false;
  materialTransferItems: SelectablePRItem[] = [];
  transferProjectName = '';
  transferSupplierId: number | null = null;
  materialTransferRemarks = '';
  
  sortOptions = [
    { value: 'date-created', label: 'Date Created' },
    { value: 'pr-date', label: 'PR Date' },
    { value: 'priority', label: 'Priority' }
  ];
  currentSort = 'date-created';

  constructor(
    private prService: PurchaseRequisitionService,
    private unitService: UnitOfMeasureService,
    private itemService: ItemService,
    private router: Router,
    private settingsService: SettingsService,
    private warehouseService: WarehouseService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.prService.getAll().subscribe({
      next: (data) => {
        this.requisitions = data;
        this.filterByStatus();
      },
      error: () => {
        this.requisitions = [];
        this.filterByStatus();
      }
    });
    
    this.unitService.getActive().subscribe({
      next: (data) => this.units = data,
      error: () => this.units = []
    });
    
    this.itemService.getActive().subscribe({
      next: (data) => this.items = data,
      error: () => this.items = []
    });
    
    this.warehouseService.getActiveWarehouses().subscribe({
      next: (data: Warehouse[]) => this.warehouses = data,
      error: () => this.warehouses = []
    });
    
    this.supplierService.getActive().subscribe({
      next: (data) => this.suppliers = data,
      error: () => this.suppliers = []
    });
  }

  filterByStatus(): void {
    this.draftPRs = this.requisitions.filter(pr => pr.status === 'Draft');
    this.submittedPRs = this.requisitions.filter(pr => pr.status === 'Submitted');
    this.approvedPRs = this.requisitions.filter(pr => pr.status === 'Approved');
    this.partiallyFulfilledPRs = this.requisitions.filter(pr => pr.status === 'Partially Fulfilled');
    this.fullyFulfilledPRs = this.requisitions.filter(pr => pr.status === 'Fully Fulfilled');
    this.rejectedPRs = this.requisitions.filter(pr => pr.status === 'Rejected');
  }

  getFilteredPRs(list: PurchaseRequisition[]): PurchaseRequisition[] {
    if (!this.searchTerm) return list;
    const term = this.searchTerm.toLowerCase();
    return list.filter(pr => 
      pr.prNumber?.toLowerCase().includes(term) ||
      pr.department?.toLowerCase().includes(term) ||
      pr.requestedBy?.toLowerCase().includes(term)
    );
  }

  getEmptyPR(): PurchaseRequisition {
    const today = new Date().toISOString().split('T')[0];
    return {
      prNumber: '',
      prDate: today,
      requiredDate: '',
      requestedBy: 'Current User',
      department: '',
      deliveryLocation: '',
      purpose: '',
      priority: 'Normal',
      status: 'Draft',
      items: [this.getEmptyItem()],
      commentsCount: 0
    };
  }

  getEmptyItem(): PRItem {
    return {
      itemId: undefined,
      itemCode: '',
      itemName: '',
      itemDescription: '',
      quantity: 0,
      fulfilledQuantity: 0,
      uom: '',
      remarks: '',
      status: 'Pending'
    };
  }

  openNewModal(): void {
    this.isEditing = false;
    this.selectedPR = this.getEmptyPR();
    this.generatePRNumber();
    this.showModal = true;
  }

  generatePRNumber(): void {
    this.settingsService.generatePrefixId('pr').subscribe({
      next: (prNumber) => {
        this.selectedPR.prNumber = prNumber;
      },
      error: (err) => {
        console.error('Error generating PR number', err);
        this.selectedPR.prNumber = this.prService.generatePRNumber();
      }
    });
  }

  openEditModal(pr: PurchaseRequisition): void {
    this.isEditing = true;
    this.selectedPR = JSON.parse(JSON.stringify(pr));
    if (!this.selectedPR.items || this.selectedPR.items.length === 0) {
      this.selectedPR.items = [this.getEmptyItem()];
    }
    this.showModal = true;
  }

  viewPR(pr: PurchaseRequisition): void {
    this.openEditModal(pr);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPR = this.getEmptyPR();
  }

  addItem(): void {
    this.selectedPR.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedPR.items.length > 1) {
      this.selectedPR.items.splice(index, 1);
    }
  }

  onItemSelect(index: number): void {
    const selectedItem = this.items.find(i => i.name === this.selectedPR.items[index].itemName);
    if (selectedItem) {
      this.selectedPR.items[index].itemId = selectedItem.id;
      this.selectedPR.items[index].itemCode = selectedItem.code || '';
      this.selectedPR.items[index].itemDescription = selectedItem.description || '';
      this.selectedPR.items[index].uom = selectedItem.unitOfMeasure?.symbol || selectedItem.unitOfMeasure?.code || '';
    }
  }

  saveDraft(): void {
    this.selectedPR.status = 'Draft';
    this.saveRequisition();
  }

  submitPR(): void {
    this.selectedPR.status = 'Submitted';
    this.saveRequisition();
  }

  saveRequisition(): void {
    const validItems = this.selectedPR.items.filter(item => item.itemName && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item with name and quantity.');
      return;
    }
    this.selectedPR.items = validItems;

    if (this.isEditing && this.selectedPR.id) {
      this.prService.update(this.selectedPR.id, this.selectedPR).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error updating PR:', err)
      });
    } else {
      this.prService.create(this.selectedPR).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error creating PR:', err)
      });
    }
  }

  deletePR(pr: PurchaseRequisition): void {
    if (pr.status !== 'Draft') {
      alert('Only Draft PRs can be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${pr.prNumber}?`)) {
      if (pr.id) {
        this.prService.delete(pr.id).subscribe({
          next: () => this.loadData(),
          error: (err) => console.error('Error deleting PR:', err)
        });
      }
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'priority-critical';
      case 'Urgent': return 'priority-urgent';
      default: return 'priority-normal';
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  canEdit(pr: PurchaseRequisition): boolean {
    return pr.status === 'Draft';
  }

  canDelete(pr: PurchaseRequisition): boolean {
    return pr.status === 'Draft';
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'kanban' ? 'table' : 'kanban';
  }

  getAllFilteredPRs(): PurchaseRequisition[] {
    if (!this.searchTerm) return this.requisitions;
    const term = this.searchTerm.toLowerCase();
    return this.requisitions.filter(pr => 
      pr.prNumber?.toLowerCase().includes(term) ||
      pr.department?.toLowerCase().includes(term) ||
      pr.requestedBy?.toLowerCase().includes(term)
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Submitted': return 'status-submitted';
      case 'Approved': return 'status-approved';
      case 'Partially Fulfilled': return 'status-partial';
      case 'Fully Fulfilled': return 'status-fulfilled';
      case 'Rejected': return 'status-rejected';
      default: return 'status-default';
    }
  }

  canSubmit(pr: PurchaseRequisition): boolean {
    return pr.status === 'Draft';
  }

  canApproveReject(pr: PurchaseRequisition): boolean {
    return pr.status === 'Submitted' && this.isAdmin;
  }

  canConvertToPO(pr: PurchaseRequisition): boolean {
    return pr.status === 'Approved' || pr.status === 'Partially Fulfilled';
  }

  canFulfillFromStock(pr: PurchaseRequisition): boolean {
    return pr.status === 'Approved' || pr.status === 'Partially Fulfilled';
  }

  canMaterialTransfer(pr: PurchaseRequisition): boolean {
    return pr.status === 'Approved' || pr.status === 'Partially Fulfilled';
  }

  isCompleted(pr: PurchaseRequisition): boolean {
    return pr.status === 'Fully Fulfilled';
  }

  isRejected(pr: PurchaseRequisition): boolean {
    return pr.status === 'Rejected';
  }

  approvePR(pr: PurchaseRequisition, event?: Event): void {
    event?.stopPropagation();
    if (!this.canApproveReject(pr)) return;
    
    if (confirm(`Are you sure you want to approve ${pr.prNumber}?`)) {
      if (pr.id) {
        this.prService.approve(pr.id).subscribe({
          next: () => this.loadData(),
          error: (err) => console.error('Error approving PR:', err)
        });
      }
    }
  }

  rejectPR(pr: PurchaseRequisition, event?: Event): void {
    event?.stopPropagation();
    if (!this.canApproveReject(pr)) return;
    
    const reason = prompt(`Enter rejection reason for ${pr.prNumber}:`);
    if (reason) {
      if (pr.id) {
        this.prService.reject(pr.id, reason).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
          },
          error: (err) => console.error('Error rejecting PR:', err)
        });
      }
    }
  }

  convertToPO(pr: PurchaseRequisition, event?: Event): void {
    event?.stopPropagation();
    if (!this.canConvertToPO(pr)) return;
    this.router.navigate(['/app/purchase/fulfillment/convert-to-po'], { queryParams: { prId: pr.id } });
  }

  fulfillFromStock(pr: PurchaseRequisition, event?: Event): void {
    event?.stopPropagation();
    if (!this.canFulfillFromStock(pr)) return;
    this.router.navigate(['/app/purchase/fulfillment/stock-issue'], { queryParams: { prId: pr.id } });
  }

  materialTransfer(pr: PurchaseRequisition, event?: Event): void {
    event?.stopPropagation();
    if (!this.canMaterialTransfer(pr)) return;
    this.router.navigate(['/app/purchase/fulfillment/material-transfer'], { queryParams: { prId: pr.id } });
  }

  getItemStatusClass(status: string | undefined): string {
    switch (status) {
      case 'Pending': return 'item-pending';
      case 'Partially Fulfilled': return 'item-partial';
      case 'Fully Fulfilled': return 'item-fulfilled';
      default: return 'item-pending';
    }
  }

  calculateFulfillmentProgress(pr: PurchaseRequisition): number {
    if (!pr.items || pr.items.length === 0) return 0;
    const totalQty = pr.items.reduce((sum, item) => sum + item.quantity, 0);
    const fulfilledQty = pr.items.reduce((sum, item) => sum + (item.fulfilledQuantity || 0), 0);
    return totalQty > 0 ? Math.round((fulfilledQty / totalQty) * 100) : 0;
  }

  printPR(pr: PurchaseRequisition): void {
    if (pr.id) {
      this.router.navigate(['/app/purchase/requisition', pr.id, 'print']);
    }
  }

  openViewModal(pr: PurchaseRequisition): void {
    this.selectedPR = JSON.parse(JSON.stringify(pr));
    this.viewTabActive = 'purchaseOrders';
    this.showViewModal = true;
    this.loadViewTabData();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.purchaseOrders = [];
    this.stockFulfillments = [];
    this.materialTransfers = [];
  }

  loadViewTabData(): void {
    if (!this.selectedPR.id) return;
    
    this.prService.getPurchaseOrdersByPrId(this.selectedPR.id).subscribe({
      next: (data) => this.purchaseOrders = data,
      error: () => this.purchaseOrders = []
    });
    
    this.prService.getStockFulfillmentsByPrId(this.selectedPR.id).subscribe({
      next: (data) => this.stockFulfillments = data,
      error: () => this.stockFulfillments = []
    });
    
    this.prService.getMaterialTransfersByPrId(this.selectedPR.id).subscribe({
      next: (data) => this.materialTransfers = data,
      error: () => this.materialTransfers = []
    });
  }

  openStockFulfillmentModal(pr: PurchaseRequisition, event?: Event): void {
    event?.stopPropagation();
    if (!this.canFulfillFromStock(pr)) return;
    
    this.selectedPR = JSON.parse(JSON.stringify(pr));
    this.stockFulfillmentItems = this.selectedPR.items
      .filter(item => (item.quantity - (item.fulfilledQuantity || 0)) > 0)
      .map(item => ({
        ...item,
        selected: false,
        fulfillQty: item.quantity - (item.fulfilledQuantity || 0)
      }));
    this.selectedWarehouseId = null;
    this.selectedSupplierId = null;
    this.stockFulfillmentRemarks = '';
    this.showStockFulfillmentModal = true;
  }

  closeStockFulfillmentModal(): void {
    this.showStockFulfillmentModal = false;
    this.stockFulfillmentItems = [];
  }

  saveStockFulfillment(): void {
    const selectedItems = this.stockFulfillmentItems.filter(item => item.selected && item.fulfillQty && item.fulfillQty > 0);
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item to fulfill.');
      return;
    }
    
    if (!this.selectedWarehouseId && !this.selectedSupplierId) {
      alert('Please select a warehouse or supplier.');
      return;
    }
    
    const fulfillment: StockFulfillment = {
      prId: this.selectedPR.id!,
      warehouseId: this.selectedWarehouseId || undefined,
      supplierId: this.selectedSupplierId || undefined,
      remarks: this.stockFulfillmentRemarks,
      items: selectedItems.map(item => ({
        prItemId: item.id!,
        itemId: item.itemId!,
        quantity: item.fulfillQty!
      }))
    };
    
    this.prService.createStockFulfillment(fulfillment).subscribe({
      next: () => {
        this.closeStockFulfillmentModal();
        this.loadData();
        alert('Stock fulfillment created successfully!');
      },
      error: (err) => {
        console.error('Error creating stock fulfillment:', err);
        alert('Error creating stock fulfillment. Please try again.');
      }
    });
  }

  openMaterialTransferModal(pr: PurchaseRequisition, event?: Event): void {
    event?.stopPropagation();
    if (!this.canMaterialTransfer(pr)) return;
    
    this.selectedPR = JSON.parse(JSON.stringify(pr));
    this.materialTransferItems = this.selectedPR.items
      .filter(item => (item.quantity - (item.fulfilledQuantity || 0)) > 0)
      .map(item => ({
        ...item,
        selected: false,
        fulfillQty: item.quantity - (item.fulfilledQuantity || 0)
      }));
    this.transferProjectName = '';
    this.transferSupplierId = null;
    this.materialTransferRemarks = '';
    this.showMaterialTransferModal = true;
  }

  closeMaterialTransferModal(): void {
    this.showMaterialTransferModal = false;
    this.materialTransferItems = [];
  }

  saveMaterialTransfer(): void {
    const selectedItems = this.materialTransferItems.filter(item => item.selected && item.fulfillQty && item.fulfillQty > 0);
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item to transfer.');
      return;
    }
    
    const transfer: MaterialTransfer = {
      prId: this.selectedPR.id!,
      projectName: this.transferProjectName,
      supplierId: this.transferSupplierId || undefined,
      remarks: this.materialTransferRemarks,
      items: selectedItems.map(item => ({
        prItemId: item.id!,
        itemId: item.itemId!,
        quantity: item.fulfillQty!
      }))
    };
    
    this.prService.createMaterialTransfer(transfer).subscribe({
      next: () => {
        this.closeMaterialTransferModal();
        this.loadData();
        alert('Material transfer created successfully!');
      },
      error: (err) => {
        console.error('Error creating material transfer:', err);
        alert('Error creating material transfer. Please try again.');
      }
    });
  }

  toggleAllItems(items: SelectablePRItem[], event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    items.forEach(item => item.selected = checked);
  }

  getRemainingQty(item: PRItem): number {
    return item.quantity - (item.fulfilledQuantity || 0);
  }
}
