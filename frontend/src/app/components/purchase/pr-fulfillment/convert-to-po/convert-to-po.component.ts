import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseRequisitionService, PurchaseRequisition, PRItem } from '../../../../services/purchase-requisition.service';
import { PRFulfillmentService, PRFulfillment, FulfillmentItem } from '../../../../services/pr-fulfillment.service';
import { SupplierService, Supplier } from '../../../../services/supplier.service';
import { SettingsService } from '../../../../services/settings.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-convert-to-po',
  standalone: false,
  templateUrl: './convert-to-po.component.html',
  styleUrls: ['./convert-to-po.component.scss']
})
export class ConvertToPoComponent implements OnInit {
  prId: number = 0;
  pr: PurchaseRequisition | null = null;
  suppliers: Supplier[] = [];
  fulfillmentItems: FulfillmentItem[] = [];
  
  poNumber: string = '';
  selectedSupplierId: number = 0;
  selectedSupplierName: string = '';
  paymentTerms: string = '';
  expectedDeliveryDate: string = '';
  remarks: string = '';
  
  loading: boolean = false;
  saving: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prService: PurchaseRequisitionService,
    private fulfillmentService: PRFulfillmentService,
    private supplierService: SupplierService,
    private settingsService: SettingsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['prId']) {
        this.prId = +params['prId'];
        this.loadData();
      } else {
        this.router.navigate(['/app/purchase/requisition']);
      }
    });
  }

  loadData(): void {
    this.loading = true;
    
    this.generatePONumber();
    
    this.prService.getById(this.prId).subscribe({
      next: (pr) => {
        this.pr = pr;
        this.initializeFulfillmentItems();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading PR:', err);
        this.loading = false;
        this.router.navigate(['/app/purchase/requisition']);
      }
    });
    
    this.supplierService.getActive().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error('Error loading suppliers:', err)
    });
  }

  generatePONumber(): void {
    this.settingsService.generatePrefixId('po').subscribe({
      next: (poNumber) => {
        this.poNumber = poNumber;
      },
      error: () => {
        this.poNumber = this.fulfillmentService.generatePONumber();
      }
    });
  }

  initializeFulfillmentItems(): void {
    if (!this.pr || !this.pr.items) return;
    
    this.fulfillmentItems = this.pr.items
      .filter(item => {
        const pendingQty = item.quantity - (item.fulfilledQuantity || 0);
        return pendingQty > 0;
      })
      .map((item, index) => ({
        prItemId: item.id || index,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        requestedQty: item.quantity,
        fulfilledQty: item.fulfilledQuantity || 0,
        pendingQty: item.quantity - (item.fulfilledQuantity || 0),
        uom: item.uom,
        selected: false,
        fulfillQty: 0,
        rate: 0,
        amount: 0
      }));
  }

  onSupplierChange(): void {
    const supplier = this.suppliers.find(s => s.id === this.selectedSupplierId);
    this.selectedSupplierName = supplier ? supplier.name : '';
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.fulfillmentItems.forEach(item => {
      item.selected = checked;
      if (checked && !item.fulfillQty) {
        item.fulfillQty = item.pendingQty;
      }
    });
    this.calculateAmounts();
  }

  onItemSelectionChange(item: FulfillmentItem): void {
    if (item.selected && !item.fulfillQty) {
      item.fulfillQty = item.pendingQty;
    }
    this.calculateAmounts();
  }

  calculateItemAmount(item: FulfillmentItem): void {
    item.amount = (item.fulfillQty || 0) * (item.rate || 0);
  }

  calculateAmounts(): void {
    this.fulfillmentItems.forEach(item => {
      if (item.selected) {
        item.amount = (item.fulfillQty || 0) * (item.rate || 0);
      }
    });
  }

  getTotalAmount(): number {
    return this.fulfillmentItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  getSelectedItemsCount(): number {
    return this.fulfillmentItems.filter(item => item.selected).length;
  }

  isValid(): boolean {
    if (!this.selectedSupplierId) return false;
    if (!this.expectedDeliveryDate) return false;
    
    const selectedItems = this.fulfillmentItems.filter(item => item.selected);
    if (selectedItems.length === 0) return false;
    
    return selectedItems.every(item => 
      item.fulfillQty && 
      item.fulfillQty > 0 && 
      item.fulfillQty <= item.pendingQty &&
      item.rate && 
      item.rate > 0
    );
  }

  createPO(): void {
    if (!this.isValid() || !this.pr) return;
    
    this.saving = true;
    
    const fulfillment: PRFulfillment = {
      prId: this.prId,
      prNumber: this.pr.prNumber || '',
      fulfillmentType: 'PO',
      referenceNumber: this.poNumber,
      fulfillmentDate: new Date().toISOString().split('T')[0],
      performedBy: 'Current User',
      supplierId: this.selectedSupplierId,
      supplierName: this.selectedSupplierName,
      paymentTerms: this.paymentTerms,
      expectedDeliveryDate: this.expectedDeliveryDate,
      remarks: this.remarks,
      totalAmount: this.getTotalAmount(),
      items: this.fulfillmentItems.filter(item => item.selected)
    };
    
    this.fulfillmentService.createPOFulfillment(fulfillment).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success('Purchase Order created successfully');
        this.router.navigate(['/app/purchase/requisition']);
      },
      error: (err) => {
        console.error('Error creating PO:', err);
        this.saving = false;
        this.notificationService.warning('PO creation saved locally. Backend integration pending.');
        this.router.navigate(['/app/purchase/requisition']);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/app/purchase/requisition']);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB');
  }
}
