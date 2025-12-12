import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';

interface GRNItem {
  itemName: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  uom: string;
  rate: number;
  amount: number;
}

interface GRN {
  id?: string;
  grnNumber: string;
  date: string;
  supplier: string;
  poRef: string;
  items: GRNItem[];
  totalQty: number;
  totalValue: number;
  status: string;
  remarks?: string;
}

@Component({
  selector: 'app-goods-receipt',
  standalone: false,
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.scss']
})
export class GoodsReceiptComponent implements OnInit {
  grnList: GRN[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedGRN: GRN = this.getEmptyGRN();
  loading: boolean = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadGRNs();
  }

  loadGRNs(): void {
    this.loading = true;
    this.grnList = [];
    this.loading = false;
  }

  getEmptyGRN(): GRN {
    return {
      grnNumber: '',
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      poRef: '',
      items: [],
      totalQty: 0,
      totalValue: 0,
      status: 'Draft'
    };
  }

  getEmptyItem(): GRNItem {
    return {
      itemName: '',
      description: '',
      orderedQty: 0,
      receivedQty: 0,
      uom: '',
      rate: 0,
      amount: 0
    };
  }

  openModal(grn?: GRN) {
    if (grn) {
      this.editMode = true;
      this.selectedGRN = { ...grn, items: [...grn.items] };
    } else {
      this.editMode = false;
      this.selectedGRN = this.getEmptyGRN();
      this.generateGRNNumber();
      this.addItem();
    }
    this.showModal = true;
  }

  generateGRNNumber(): void {
    this.settingsService.generatePrefixId('grn').subscribe({
      next: (grnNumber) => {
        this.selectedGRN.grnNumber = grnNumber;
      },
      error: (err) => console.error('Error generating GRN number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedGRN = this.getEmptyGRN();
  }

  addItem(): void {
    this.selectedGRN.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedGRN.items.length > 1) {
      this.selectedGRN.items.splice(index, 1);
    }
  }

  calculateItemAmount(item: GRNItem): void {
    item.amount = item.receivedQty * item.rate;
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.selectedGRN.totalQty = this.selectedGRN.items.reduce((sum, item) => sum + item.receivedQty, 0);
    this.selectedGRN.totalValue = this.selectedGRN.items.reduce((sum, item) => sum + item.amount, 0);
  }

  saveGRN(): void {
    this.calculateTotals();
    console.log('Saving GRN:', this.selectedGRN);
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
