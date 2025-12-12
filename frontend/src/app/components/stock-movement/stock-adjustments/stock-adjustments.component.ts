import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';

interface AdjustmentItem {
  itemName: string;
  description: string;
  currentQty: number;
  adjustedQty: number;
  variance: number;
  uom: string;
  reason: string;
}

interface StockAdjustment {
  id?: string;
  adjustmentNumber: string;
  date: string;
  warehouse: string;
  adjustmentType: string;
  items: AdjustmentItem[];
  status: string;
  remarks?: string;
}

@Component({
  selector: 'app-stock-adjustments',
  standalone: false,
  templateUrl: './stock-adjustments.component.html',
  styleUrls: ['./stock-adjustments.component.scss']
})
export class StockAdjustmentsComponent implements OnInit {
  adjustments: StockAdjustment[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedAdjustment: StockAdjustment = this.getEmptyAdjustment();
  loading: boolean = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadAdjustments();
  }

  loadAdjustments(): void {
    this.loading = true;
    this.adjustments = [];
    this.loading = false;
  }

  getEmptyAdjustment(): StockAdjustment {
    return {
      adjustmentNumber: '',
      date: new Date().toISOString().split('T')[0],
      warehouse: '',
      adjustmentType: 'Inventory Count',
      items: [],
      status: 'Draft'
    };
  }

  getEmptyItem(): AdjustmentItem {
    return {
      itemName: '',
      description: '',
      currentQty: 0,
      adjustedQty: 0,
      variance: 0,
      uom: '',
      reason: ''
    };
  }

  openModal(adjustment?: StockAdjustment) {
    if (adjustment) {
      this.editMode = true;
      this.selectedAdjustment = { ...adjustment, items: [...adjustment.items] };
    } else {
      this.editMode = false;
      this.selectedAdjustment = this.getEmptyAdjustment();
      this.generateAdjustmentNumber();
      this.addItem();
    }
    this.showModal = true;
  }

  generateAdjustmentNumber(): void {
    this.settingsService.generatePrefixId('adjustment').subscribe({
      next: (adjustmentNumber) => {
        this.selectedAdjustment.adjustmentNumber = adjustmentNumber;
      },
      error: (err) => console.error('Error generating adjustment number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedAdjustment = this.getEmptyAdjustment();
  }

  addItem(): void {
    this.selectedAdjustment.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedAdjustment.items.length > 1) {
      this.selectedAdjustment.items.splice(index, 1);
    }
  }

  calculateVariance(item: AdjustmentItem): void {
    item.variance = item.adjustedQty - item.currentQty;
  }

  saveAdjustment(): void {
    console.log('Saving adjustment:', this.selectedAdjustment);
    this.closeModal();
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Draft': 'badge-info'
    };
    return classes[status] || 'badge-info';
  }
}
