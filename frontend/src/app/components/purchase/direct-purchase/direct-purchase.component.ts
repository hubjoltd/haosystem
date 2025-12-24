import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DirectPurchaseService, DirectPurchase, DirectPurchaseItem } from '../../../services/direct-purchase.service';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { UnitOfMeasureService, UnitOfMeasure } from '../../../services/unit-of-measure.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-direct-purchase',
  standalone: false,
  templateUrl: './direct-purchase.component.html',
  styleUrls: ['./direct-purchase.component.scss']
})
export class DirectPurchaseComponent implements OnInit {
  purchases: DirectPurchase[] = [];
  suppliers: Supplier[] = [];
  units: UnitOfMeasure[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  viewMode: 'kanban' | 'table' = 'table';
  selectedPurchase: DirectPurchase = this.getEmptyPurchase();
  loading: boolean = false;

  constructor(
    private directPurchaseService: DirectPurchaseService,
    private supplierService: SupplierService,
    private unitService: UnitOfMeasureService,
    private router: Router,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadPurchases();
    this.loadSuppliers();
    this.loadUnits();
  }

  loadPurchases(): void {
    this.loading = false;
    this.directPurchaseService.getAll().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading direct purchases', err);
        this.loading = false;
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getActive().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error('Error loading suppliers', err)
    });
  }

  loadUnits(): void {
    this.unitService.getActive().subscribe({
      next: (data) => this.units = data,
      error: (err) => console.error('Error loading units', err)
    });
  }

  get filteredPurchases() {
    if (!this.searchQuery) return this.purchases;
    const query = this.searchQuery.toLowerCase();
    return this.purchases.filter(p => 
      p.poNumber?.toLowerCase().includes(query) ||
      p.supplierName?.toLowerCase().includes(query)
    );
  }

  getEmptyPurchase(): DirectPurchase {
    return {
      poType: 'Direct Purchase',
      supplierId: 0,
      supplierName: '',
      deliveryLocation: '',
      paymentTerms: '',
      deliveryDate: '',
      status: 'Draft',
      items: []
    };
  }

  getEmptyItem(): DirectPurchaseItem {
    return {
      itemName: '',
      description: '',
      quantity: 0,
      uom: '',
      rate: 0,
      amount: 0,
      remarks: ''
    };
  }

  openModal(purchase?: DirectPurchase) {
    if (purchase) {
      this.editMode = true;
      this.selectedPurchase = { ...purchase, items: [...purchase.items] };
    } else {
      this.editMode = false;
      this.selectedPurchase = this.getEmptyPurchase();
      this.generatePONumber();
      this.addItem();
    }
    this.showModal = true;
  }

  generatePONumber(): void {
    this.settingsService.generatePrefixId('po').subscribe({
      next: (poNumber) => {
        this.selectedPurchase.poNumber = poNumber;
      },
      error: (err) => console.error('Error generating PO number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedPurchase = this.getEmptyPurchase();
  }

  addItem(): void {
    this.selectedPurchase.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedPurchase.items.length > 1) {
      this.selectedPurchase.items.splice(index, 1);
    }
  }

  calculateItemAmount(item: DirectPurchaseItem): void {
    item.amount = item.quantity * item.rate;
  }

  getTotalAmount(): number {
    return this.selectedPurchase.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : '';
  }

  savePurchase(): void {
    this.selectedPurchase.totalAmount = this.getTotalAmount();
    this.selectedPurchase.supplierName = this.getSupplierName(this.selectedPurchase.supplierId);

    if (this.editMode && this.selectedPurchase.id) {
      this.directPurchaseService.update(this.selectedPurchase.id, this.selectedPurchase).subscribe({
        next: () => {
          this.loadPurchases();
          this.closeModal();
        },
        error: (err) => console.error('Error updating purchase', err)
      });
    } else {
      this.directPurchaseService.create(this.selectedPurchase).subscribe({
        next: () => {
          this.loadPurchases();
          this.closeModal();
        },
        error: (err) => console.error('Error creating purchase', err)
      });
    }
  }

  deletePurchase(id: number): void {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      this.directPurchaseService.delete(id).subscribe({
        next: () => this.loadPurchases(),
        error: (err) => console.error('Error deleting purchase', err)
      });
    }
  }

  viewPurchase(purchase: DirectPurchase): void {
    this.openModal(purchase);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Draft': return 'badge-secondary';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'kanban' ? 'table' : 'kanban';
  }

  get draftPurchases(): DirectPurchase[] {
    return this.filteredPurchases.filter(p => 
      p.status === 'Draft' || p.status?.toLowerCase().includes('draft')
    );
  }

  get pendingPurchases(): DirectPurchase[] {
    return this.filteredPurchases.filter(p => 
      p.status === 'Pending' || 
      p.status === 'Pending Approval' || 
      p.status?.toLowerCase().includes('pending')
    );
  }

  get completedPurchases(): DirectPurchase[] {
    return this.filteredPurchases.filter(p => 
      p.status === 'Completed' || 
      p.status === 'Approved' ||
      p.status?.toLowerCase().includes('complete')
    );
  }

  printPO(purchase: DirectPurchase): void {
    if (purchase.id) {
      this.router.navigate(['/app/purchase/direct', purchase.id, 'print']);
    }
  }
}
