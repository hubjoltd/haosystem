import { Component, OnInit } from '@angular/core';
import { WarehouseService, Warehouse, Bin } from '../../../services/warehouse.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-warehouse-bin',
  standalone: false,
  templateUrl: './warehouse-bin.component.html',
  styleUrls: ['./warehouse-bin.component.scss']
})
export class WarehouseBinComponent implements OnInit {
  warehouses: Warehouse[] = [];
  warehouseBins: { [key: number]: Bin[] } = {};
  expandedWarehouse: number | null = null;
  showModal: boolean = false;
  modalType: string = '';
  editMode: boolean = false;
  selectedWarehouse: Warehouse = this.getEmptyWarehouse();
  selectedBin: Bin = this.getEmptyBin();
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private warehouseService: WarehouseService,
    private settingsService: SettingsService
  ) {}

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
      address: '',
      status: 'Active'
    };
  }

  getEmptyBin(): Bin {
    return {
      code: '',
      name: '',
      zone: '',
      aisle: '',
      rack: '',
      shelf: '',
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
    this.errorMessage = '';
    if (type === 'warehouse') {
      if (item) {
        this.editMode = true;
        this.selectedWarehouse = { ...item } as Warehouse;
      } else {
        this.editMode = false;
        this.selectedWarehouse = this.getEmptyWarehouse();
        this.generateWarehouseCode();
      }
    } else if (type === 'bin') {
      if (item) {
        this.editMode = true;
        this.selectedBin = { ...item } as Bin;
      } else {
        this.editMode = false;
        this.selectedBin = this.getEmptyBin();
        this.generateBinCode();
      }
    }
    this.showModal = true;
  }

  generateWarehouseCode(): void {
    this.settingsService.generatePrefixId('warehouse').subscribe({
      next: (code) => {
        this.selectedWarehouse.code = code;
      },
      error: (err) => console.error('Error generating warehouse code', err)
    });
  }

  generateBinCode(): void {
    this.settingsService.generatePrefixId('bin').subscribe({
      next: (code) => {
        this.selectedBin.code = code;
      },
      error: (err) => console.error('Error generating bin code', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.errorMessage = '';
  }

  isWarehouseFormValid(): boolean {
    return this.selectedWarehouse.code.trim() !== '' && 
           this.selectedWarehouse.name.trim() !== '';
  }

  isBinFormValid(): boolean {
    return this.selectedBin.code.trim() !== '' && 
           this.selectedBin.name.trim() !== '';
  }

  saveWarehouse(): void {
    if (!this.isWarehouseFormValid()) {
      this.errorMessage = 'Warehouse Code and Name are required';
      return;
    }

    if (this.editMode && this.selectedWarehouse.id) {
      this.warehouseService.updateWarehouse(this.selectedWarehouse.id, this.selectedWarehouse).subscribe({
        next: () => {
          this.loadWarehouses();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error updating warehouse';
        }
      });
    } else {
      this.warehouseService.createWarehouse(this.selectedWarehouse).subscribe({
        next: () => {
          this.loadWarehouses();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error creating warehouse';
        }
      });
    }
  }

  saveBin(): void {
    if (!this.isBinFormValid()) {
      this.errorMessage = 'Bin Code and Name are required';
      return;
    }

    if (this.editMode && this.selectedBin.id) {
      this.warehouseService.updateBin(this.selectedBin.id, this.selectedBin).subscribe({
        next: () => {
          if (this.expandedWarehouse) {
            this.loadBinsForWarehouse(this.expandedWarehouse);
          }
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error updating bin';
        }
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
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error creating bin';
        }
      });
    }
  }

  deleteWarehouse(id: number): void {
    if (confirm('Are you sure you want to delete this warehouse? All bins inside will also be deleted.')) {
      this.warehouseService.deleteWarehouse(id).subscribe({
        next: () => this.loadWarehouses(),
        error: (err) => {
          alert(err.error?.error || 'Error deleting warehouse');
        }
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
        error: (err) => {
          alert(err.error?.error || 'Error deleting bin');
        }
      });
    }
  }

  getBinsForWarehouse(warehouseId: number): Bin[] {
    return this.warehouseBins[warehouseId] || [];
  }

  openBinModal(warehouseId: number): void {
    this.selectedBin = this.getEmptyBin();
    this.selectedBin.warehouseId = warehouseId;
    this.modalType = 'bin';
    this.editMode = false;
    this.errorMessage = '';
    this.generateBinCode();
    this.showModal = true;
  }

  editBin(bin: Bin): void {
    this.modalType = 'bin';
    this.editMode = true;
    this.selectedBin = { ...bin };
    this.errorMessage = '';
    this.showModal = true;
  }
}
