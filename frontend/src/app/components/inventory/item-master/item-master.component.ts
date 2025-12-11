import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { UnitOfMeasureService, UnitOfMeasure } from '../../../services/unit-of-measure.service';

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
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedItem: Item = this.getEmptyItem();
  loading: boolean = false;

  constructor(
    private itemService: ItemService,
    private itemGroupService: ItemGroupService,
    private unitOfMeasureService: UnitOfMeasureService
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

    this.itemGroupService.getAll().subscribe({
      next: (data) => this.groups = data,
      error: (err) => console.error('Error loading groups', err)
    });

    this.unitOfMeasureService.getAll().subscribe({
      next: (data) => this.units = data,
      error: (err) => console.error('Error loading units', err)
    });
  }

  get filteredItems() {
    if (!this.searchQuery) return this.items;
    return this.items.filter(item => 
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getEmptyItem(): Item {
    return {
      code: '',
      name: '',
      description: '',
      groupName: '',
      unit: '',
      costPrice: 0,
      sellPrice: 0,
      currentStock: 0,
      reorderLevel: 0,
      status: 'Active'
    };
  }

  openModal(item?: Item) {
    if (item) {
      this.editMode = true;
      this.selectedItem = { ...item };
    } else {
      this.editMode = false;
      this.selectedItem = this.getEmptyItem();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedItem = this.getEmptyItem();
  }

  saveItem(): void {
    if (this.editMode && this.selectedItem.id) {
      this.itemService.update(this.selectedItem.id, this.selectedItem).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error updating item', err)
      });
    } else {
      this.itemService.create(this.selectedItem).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error creating item', err)
      });
    }
  }

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting item', err)
      });
    }
  }

  getStockClass(item: Item): string {
    if (item.currentStock <= 0) {
      return 'badge-danger';
    }
    if (item.currentStock <= item.reorderLevel) {
      return 'badge-warning';
    }
    return 'badge-success';
  }

  getStockStatus(item: Item): string {
    if (item.currentStock <= 0) {
      return 'Out of Stock';
    }
    if (item.currentStock <= item.reorderLevel) {
      return 'Low Stock';
    }
    return 'In Stock';
  }

  getInStockCount(): number {
    return this.items.filter(i => i.currentStock > i.reorderLevel).length;
  }

  getLowStockCount(): number {
    return this.items.filter(i => i.currentStock <= i.reorderLevel && i.currentStock > 0).length;
  }

  getOutOfStockCount(): number {
    return this.items.filter(i => i.currentStock <= 0).length;
  }
}
