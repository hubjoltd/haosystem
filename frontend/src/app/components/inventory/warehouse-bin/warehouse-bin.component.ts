import { Component, OnInit } from '@angular/core';
import { WarehouseService, Warehouse, Bin } from '../../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-bin',
  standalone: false,
  templateUrl: './warehouse-bin.component.html',
  styleUrls: ['./warehouse-bin.component.scss']
})
export class WarehouseBinComponent implements OnInit {
  warehouses: Warehouse[] = [];
  bins: Bin[] = [];
  warehouseBins: { [key: number]: Bin[] } = {};
  expandedWarehouse: number | null = null;
  showModal: boolean = false;
  modalType: string = '';
  editMode: boolean = false;
  selectedWarehouse: Warehouse = this.getEmptyWarehouse();
  selectedBin: Bin = this.getEmptyBin();
  loading: boolean = false;

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading = true;
    this.warehouseService.getAllWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading warehouses', err);
        this.loading = false;
      }
    });
  }

  loadBinsForWarehouse(warehouseId: number): void {
    this.warehouseService.getBinsByWarehouse(warehouseId).subscribe({
      next: (data) => {
        this.warehouseBins[warehouseId] = data;
      },
      error: (err) => console.error('Error loading bins', err)
    });
  }

  getEmptyWarehouse(): Warehouse {
    return {
      code: '',
      name: '',
      location: '',
      capacity: 0,
      usedCapacity: 0,
      status: 'Active'
    };
  }

  getEmptyBin(): Bin {
    return {
      code: '',
      name: '',
      capacity: 0,
      usedCapacity: 0,
      status: 'Active'
    };
  }

  toggleWarehouse(id: number) {
    if (this.expandedWarehouse === id) {
      this.expandedWarehouse = null;
    } else {
      this.expandedWarehouse = id;
      if (!this.warehouseBins[id]) {
        this.loadBinsForWarehouse(id);
      }
    }
  }

  openModal(type: string, item?: Warehouse | Bin) {
    this.modalType = type;
    if (type === 'warehouse') {
      if (item) {
        this.editMode = true;
        this.selectedWarehouse = { ...item } as Warehouse;
      } else {
        this.editMode = false;
        this.selectedWarehouse = this.getEmptyWarehouse();
      }
    } else if (type === 'bin') {
      if (item) {
        this.editMode = true;
        this.selectedBin = { ...item } as Bin;
      } else {
        this.editMode = false;
        this.selectedBin = this.getEmptyBin();
      }
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveWarehouse(): void {
    if (this.editMode && this.selectedWarehouse.id) {
      this.warehouseService.updateWarehouse(this.selectedWarehouse.id, this.selectedWarehouse).subscribe({
        next: () => {
          this.loadWarehouses();
          this.closeModal();
        },
        error: (err) => console.error('Error updating warehouse', err)
      });
    } else {
      this.warehouseService.createWarehouse(this.selectedWarehouse).subscribe({
        next: () => {
          this.loadWarehouses();
          this.closeModal();
        },
        error: (err) => console.error('Error creating warehouse', err)
      });
    }
  }

  saveBin(): void {
    if (this.editMode && this.selectedBin.id) {
      this.warehouseService.updateBin(this.selectedBin.id, this.selectedBin).subscribe({
        next: () => {
          if (this.expandedWarehouse) {
            this.loadBinsForWarehouse(this.expandedWarehouse);
          }
          this.closeModal();
        },
        error: (err) => console.error('Error updating bin', err)
      });
    } else {
      this.selectedBin.warehouseId = this.expandedWarehouse || undefined;
      this.warehouseService.createBin(this.selectedBin).subscribe({
        next: () => {
          if (this.expandedWarehouse) {
            this.loadBinsForWarehouse(this.expandedWarehouse);
          }
          this.closeModal();
        },
        error: (err) => console.error('Error creating bin', err)
      });
    }
  }

  deleteWarehouse(id: number): void {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      this.warehouseService.deleteWarehouse(id).subscribe({
        next: () => this.loadWarehouses(),
        error: (err) => console.error('Error deleting warehouse', err)
      });
    }
  }

  deleteBin(id: number): void {
    if (confirm('Are you sure you want to delete this bin?')) {
      this.warehouseService.deleteBin(id).subscribe({
        next: () => {
          if (this.expandedWarehouse) {
            this.loadBinsForWarehouse(this.expandedWarehouse);
          }
        },
        error: (err) => console.error('Error deleting bin', err)
      });
    }
  }

  getUsagePercent(used: number, capacity: number): number {
    if (!capacity) return 0;
    return (used / capacity) * 100;
  }

  getUsageClass(used: number, capacity: number): string {
    const percent = this.getUsagePercent(used, capacity);
    if (percent >= 90) return 'critical';
    if (percent >= 70) return 'warning';
    return 'normal';
  }

  getBinsForWarehouse(warehouseId: number): Bin[] {
    return this.warehouseBins[warehouseId] || [];
  }

  openBinModal(warehouseId: number): void {
    this.selectedBin = this.getEmptyBin();
    this.selectedBin.warehouseId = warehouseId;
    this.modalType = 'bin';
    this.editMode = false;
    this.showModal = true;
  }
}
