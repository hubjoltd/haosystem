import { Component } from '@angular/core';

@Component({
  selector: 'app-warehouse-bin',
  standalone: false,
  templateUrl: './warehouse-bin.component.html',
  styleUrls: ['./warehouse-bin.component.scss']
})
export class WarehouseBinComponent {
  warehouses = [
    { 
      id: 1, code: 'WH-001', name: 'Main Warehouse', location: 'Building A', capacity: 10000, used: 7500, 
      bins: [
        { code: 'BIN-A1', name: 'Aisle A Row 1', capacity: 500, used: 350 },
        { code: 'BIN-A2', name: 'Aisle A Row 2', capacity: 500, used: 420 },
        { code: 'BIN-B1', name: 'Aisle B Row 1', capacity: 500, used: 280 }
      ]
    },
    { 
      id: 2, code: 'WH-002', name: 'Secondary Warehouse', location: 'Building B', capacity: 5000, used: 3200,
      bins: [
        { code: 'BIN-C1', name: 'Aisle C Row 1', capacity: 400, used: 300 },
        { code: 'BIN-C2', name: 'Aisle C Row 2', capacity: 400, used: 250 }
      ]
    },
    { 
      id: 3, code: 'WH-003', name: 'Cold Storage', location: 'Building C', capacity: 2000, used: 1800,
      bins: [
        { code: 'BIN-F1', name: 'Freezer 1', capacity: 300, used: 280 },
        { code: 'BIN-F2', name: 'Freezer 2', capacity: 300, used: 250 }
      ]
    }
  ];

  expandedWarehouse: number | null = null;
  showModal: boolean = false;
  modalType: string = '';

  toggleWarehouse(id: number) {
    this.expandedWarehouse = this.expandedWarehouse === id ? null : id;
  }

  openModal(type: string) {
    this.modalType = type;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  getUsagePercent(used: number, capacity: number): number {
    return (used / capacity) * 100;
  }

  getUsageClass(used: number, capacity: number): string {
    const percent = this.getUsagePercent(used, capacity);
    if (percent >= 90) return 'critical';
    if (percent >= 70) return 'warning';
    return 'normal';
  }
}
