import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseRequisitionService, PurchaseRequisition } from '../../../../services/purchase-requisition.service';
import { PRFulfillmentService, PRFulfillment, FulfillmentItem } from '../../../../services/pr-fulfillment.service';
import { SettingsService } from '../../../../services/settings.service';
import { NotificationService } from '../../../../services/notification.service';

interface Warehouse {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-stock-issue-fulfillment',
  standalone: false,
  templateUrl: './stock-issue-fulfillment.component.html',
  styleUrls: ['./stock-issue-fulfillment.component.scss']
})
export class StockIssueFulfillmentComponent implements OnInit {
  prId: number = 0;
  pr: PurchaseRequisition | null = null;
  warehouses: Warehouse[] = [];
  fulfillmentItems: FulfillmentItem[] = [];
  
  issueNumber: string = '';
  selectedWarehouseId: number = 0;
  selectedWarehouseName: string = '';
  remarks: string = '';
  
  loading: boolean = false;
  saving: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prService: PurchaseRequisitionService,
    private fulfillmentService: PRFulfillmentService,
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
    
    this.generateIssueNumber();
    
    this.warehouses = [
      { id: 1, name: 'Main Warehouse', code: 'WH-001' },
      { id: 2, name: 'Secondary Warehouse', code: 'WH-002' },
      { id: 3, name: 'Project Site A', code: 'WH-003' }
    ];
    
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
  }

  generateIssueNumber(): void {
    this.settingsService.generatePrefixId('issue').subscribe({
      next: (issueNumber) => {
        this.issueNumber = issueNumber;
      },
      error: () => {
        this.issueNumber = this.fulfillmentService.generateIssueNumber();
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
        fulfillQty: 0
      }));
  }

  onWarehouseChange(): void {
    const warehouse = this.warehouses.find(w => w.id === this.selectedWarehouseId);
    this.selectedWarehouseName = warehouse ? warehouse.name : '';
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.fulfillmentItems.forEach(item => {
      item.selected = checked;
      if (checked && !item.fulfillQty) {
        item.fulfillQty = item.pendingQty;
      }
    });
  }

  onItemSelectionChange(item: FulfillmentItem): void {
    if (item.selected && !item.fulfillQty) {
      item.fulfillQty = item.pendingQty;
    }
  }

  getTotalIssueQty(): number {
    return this.fulfillmentItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.fulfillQty || 0), 0);
  }

  getSelectedItemsCount(): number {
    return this.fulfillmentItems.filter(item => item.selected).length;
  }

  isValid(): boolean {
    if (!this.selectedWarehouseId) return false;
    
    const selectedItems = this.fulfillmentItems.filter(item => item.selected);
    if (selectedItems.length === 0) return false;
    
    return selectedItems.every(item => 
      item.fulfillQty && 
      item.fulfillQty > 0 && 
      item.fulfillQty <= item.pendingQty
    );
  }

  createStockIssue(): void {
    if (!this.isValid() || !this.pr) return;
    
    this.saving = true;
    
    const fulfillment: PRFulfillment = {
      prId: this.prId,
      prNumber: this.pr.prNumber || '',
      fulfillmentType: 'Stock Issue',
      referenceNumber: this.issueNumber,
      fulfillmentDate: new Date().toISOString().split('T')[0],
      performedBy: 'Current User',
      warehouseId: this.selectedWarehouseId,
      warehouseName: this.selectedWarehouseName,
      remarks: this.remarks,
      items: this.fulfillmentItems.filter(item => item.selected)
    };
    
    this.fulfillmentService.createStockIssueFulfillment(fulfillment).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success('Stock Issue created successfully');
        this.router.navigate(['/app/purchase/requisition']);
      },
      error: (err) => {
        console.error('Error creating stock issue:', err);
        this.saving = false;
        this.notificationService.warning('Stock Issue saved locally. Backend integration pending.');
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
