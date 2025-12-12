import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { UnitOfMeasureService, UnitOfMeasure } from '../../../services/unit-of-measure.service';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-item-master',
  standalone: false,
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.scss']
})
export class ItemMasterComponent implements OnInit {
  items: Item[] = [];
  groups: ItemGroup[] = [];
  units: UnitOfMeasure[] = [];
  suppliers: Supplier[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedItem: Item = this.getEmptyItem();
  selectedGroupId: number | null = null;
  selectedUomId: number | null = null;
  selectedSupplierId: number | null = null;
  loading: boolean = false;
  errorMessage: string = '';
  nameValidationMessage: string = '';

  constructor(
    private itemService: ItemService,
    private itemGroupService: ItemGroupService,
    private unitOfMeasureService: UnitOfMeasureService,
    private supplierService: SupplierService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading items', err);
        this.loading = false;
      }
    });

    this.itemGroupService.getActive().subscribe({
      next: (data) => this.groups = data,
      error: (err) => console.error('Error loading groups', err)
    });

    this.unitOfMeasureService.getActive().subscribe({
      next: (data) => this.units = data,
      error: (err) => console.error('Error loading units', err)
    });

    this.supplierService.getAll().subscribe({
      next: (data) => this.suppliers = data.filter(s => s.status === 'Active'),
      error: (err) => console.error('Error loading suppliers', err)
    });
  }

  get filteredItems() {
    if (!this.searchQuery) return this.items;
    const query = this.searchQuery.toLowerCase();
    return this.items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      (item.group?.name || '').toLowerCase().includes(query)
    );
  }

  getEmptyItem(): Item {
    return {
      code: '',
      name: '',
      description: '',
      taxable: true,
      currentStock: 0,
      status: 'Active'
    };
  }

  openModal(item?: Item) {
    this.errorMessage = '';
    this.nameValidationMessage = '';
    if (item) {
      this.editMode = true;
      this.selectedItem = { ...item };
      this.selectedGroupId = item.group?.id || null;
      this.selectedUomId = item.unitOfMeasure?.id || null;
      this.selectedSupplierId = item.supplier?.id || null;
    } else {
      this.editMode = false;
      this.selectedItem = this.getEmptyItem();
      this.selectedGroupId = null;
      this.selectedUomId = null;
      this.selectedSupplierId = null;
      this.generateItemCode();
    }
    this.showModal = true;
  }

  generateItemCode(): void {
    this.settingsService.generatePrefixId('item').subscribe({
      next: (code) => {
        this.selectedItem.code = code;
      },
      error: (err) => console.error('Error generating item code', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedItem = this.getEmptyItem();
    this.selectedGroupId = null;
    this.selectedUomId = null;
    this.selectedSupplierId = null;
    this.errorMessage = '';
    this.nameValidationMessage = '';
  }

  validateItemName(): void {
    if (!this.selectedItem.name || !this.selectedGroupId) {
      this.nameValidationMessage = '';
      return;
    }
    
    const excludeId = this.editMode ? this.selectedItem.id : undefined;
    this.itemService.validateName(this.selectedItem.name, this.selectedGroupId, excludeId).subscribe({
      next: (response) => {
        if (!response.isUnique) {
          this.nameValidationMessage = 'Item name already exists in this group';
        } else {
          this.nameValidationMessage = '';
        }
      },
      error: () => this.nameValidationMessage = ''
    });
  }

  isFormValid(): boolean {
    return this.selectedItem.name.trim() !== '' && 
           this.selectedGroupId !== null &&
           this.selectedUomId !== null &&
           this.nameValidationMessage === '';
  }

  saveItem(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const itemToSave: Item = {
      ...this.selectedItem,
      group: this.groups.find(g => g.id === this.selectedGroupId),
      unitOfMeasure: this.units.find(u => u.id === this.selectedUomId),
      supplier: this.selectedSupplierId ? this.suppliers.find(s => s.id === this.selectedSupplierId) : undefined
    };

    if (this.editMode && this.selectedItem.id) {
      this.itemService.update(this.selectedItem.id, itemToSave).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error updating item';
        }
      });
    } else {
      this.itemService.create(itemToSave).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error creating item';
        }
      });
    }
  }

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          alert(err.error?.error || 'Error deleting item');
        }
      });
    }
  }

  getStockClass(item: Item): string {
    if (item.currentStock <= 0) {
      return 'badge-danger';
    }
    if (item.reorderLevel && item.currentStock <= item.reorderLevel) {
      return 'badge-warning';
    }
    return 'badge-success';
  }

  getStockStatus(item: Item): string {
    if (item.currentStock <= 0) {
      return 'Out of Stock';
    }
    if (item.reorderLevel && item.currentStock <= item.reorderLevel) {
      return 'Low Stock';
    }
    return 'In Stock';
  }

  getInStockCount(): number {
    return this.items.filter(i => !i.reorderLevel || i.currentStock > i.reorderLevel).length;
  }

  getLowStockCount(): number {
    return this.items.filter(i => i.reorderLevel && i.currentStock <= i.reorderLevel && i.currentStock > 0).length;
  }

  getOutOfStockCount(): number {
    return this.items.filter(i => i.currentStock <= 0).length;
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '-';
    return '$' + value.toFixed(2);
  }
}
