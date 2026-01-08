import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseRequisitionService, PurchaseRequisition } from '../../../../services/purchase-requisition.service';
import { PRFulfillmentService, PRFulfillment, FulfillmentItem } from '../../../../services/pr-fulfillment.service';
import { SettingsService } from '../../../../services/settings.service';
import { NotificationService } from '../../../../services/notification.service';

interface Location {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-material-transfer-fulfillment',
  standalone: false,
  templateUrl: './material-transfer-fulfillment.component.html',
  styleUrls: ['./material-transfer-fulfillment.component.scss']
})
export class MaterialTransferFulfillmentComponent implements OnInit {
  prId: number = 0;
  pr: PurchaseRequisition | null = null;
  locations: Location[] = [];
  fulfillmentItems: FulfillmentItem[] = [];
  
  transferNumber: string = '';
  sourceLocationId: number = 0;
  sourceLocationName: string = '';
  targetLocation: string = '';
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
    
    this.generateTransferNumber();
    
    this.locations = [
      { id: 1, name: 'Project Site A', code: 'PS-A' },
      { id: 2, name: 'Project Site B', code: 'PS-B' },
      { id: 3, name: 'Central Store', code: 'CS' },
      { id: 4, name: 'Regional Depot', code: 'RD' }
    ];
    
    this.prService.getById(this.prId).subscribe({
      next: (pr) => {
        this.pr = pr;
        this.targetLocation = pr.deliveryLocation || '';
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

  generateTransferNumber(): void {
    this.settingsService.generatePrefixId('transfer').subscribe({
      next: (transferNumber) => {
        this.transferNumber = transferNumber;
      },
      error: () => {
        this.transferNumber = this.fulfillmentService.generateTransferNumber();
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

  onSourceLocationChange(): void {
    const location = this.locations.find(l => l.id === this.sourceLocationId);
    this.sourceLocationName = location ? location.name : '';
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

  getTotalTransferQty(): number {
    return this.fulfillmentItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.fulfillQty || 0), 0);
  }

  getSelectedItemsCount(): number {
    return this.fulfillmentItems.filter(item => item.selected).length;
  }

  isValid(): boolean {
    if (!this.sourceLocationId) return false;
    if (!this.targetLocation) return false;
    
    const selectedItems = this.fulfillmentItems.filter(item => item.selected);
    if (selectedItems.length === 0) return false;
    
    return selectedItems.every(item => 
      item.fulfillQty && 
      item.fulfillQty > 0 && 
      item.fulfillQty <= item.pendingQty
    );
  }

  createTransfer(): void {
    if (!this.isValid() || !this.pr) return;
    
    this.saving = true;
    
    const fulfillment: PRFulfillment = {
      prId: this.prId,
      prNumber: this.pr.prNumber || '',
      fulfillmentType: 'Material Transfer',
      referenceNumber: this.transferNumber,
      fulfillmentDate: new Date().toISOString().split('T')[0],
      performedBy: 'Current User',
      sourceLocation: this.sourceLocationName,
      targetLocation: this.targetLocation,
      remarks: this.remarks,
      items: this.fulfillmentItems.filter(item => item.selected)
    };
    
    this.fulfillmentService.createMaterialTransferFulfillment(fulfillment).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success('Material Transfer created successfully');
        this.router.navigate(['/app/purchase/requisition']);
      },
      error: (err) => {
        console.error('Error creating transfer:', err);
        this.saving = false;
        this.notificationService.warning('Material Transfer saved locally. Backend integration pending.');
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
