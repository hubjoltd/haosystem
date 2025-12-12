import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';

interface TransferItem {
  itemName: string;
  description: string;
  quantity: number;
  uom: string;
}

interface StockTransfer {
  id?: string;
  transferNumber: string;
  date: string;
  fromWarehouse: string;
  toWarehouse: string;
  items: TransferItem[];
  totalQty: number;
  status: string;
  remarks?: string;
}

@Component({
  selector: 'app-stock-transfer',
  standalone: false,
  templateUrl: './stock-transfer.component.html',
  styleUrls: ['./stock-transfer.component.scss']
})
export class StockTransferComponent implements OnInit {
  transferList: StockTransfer[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedTransfer: StockTransfer = this.getEmptyTransfer();
  loading: boolean = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.loading = true;
    this.transferList = [];
    this.loading = false;
  }

  getEmptyTransfer(): StockTransfer {
    return {
      transferNumber: '',
      date: new Date().toISOString().split('T')[0],
      fromWarehouse: '',
      toWarehouse: '',
      items: [],
      totalQty: 0,
      status: 'Draft'
    };
  }

  getEmptyItem(): TransferItem {
    return {
      itemName: '',
      description: '',
      quantity: 0,
      uom: ''
    };
  }

  openModal(transfer?: StockTransfer) {
    if (transfer) {
      this.editMode = true;
      this.selectedTransfer = { ...transfer, items: [...transfer.items] };
    } else {
      this.editMode = false;
      this.selectedTransfer = this.getEmptyTransfer();
      this.generateTransferNumber();
      this.addItem();
    }
    this.showModal = true;
  }

  generateTransferNumber(): void {
    this.settingsService.generatePrefixId('transfer').subscribe({
      next: (transferNumber) => {
        this.selectedTransfer.transferNumber = transferNumber;
      },
      error: (err) => console.error('Error generating transfer number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedTransfer = this.getEmptyTransfer();
  }

  addItem(): void {
    this.selectedTransfer.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedTransfer.items.length > 1) {
      this.selectedTransfer.items.splice(index, 1);
    }
  }

  calculateTotals(): void {
    this.selectedTransfer.totalQty = this.selectedTransfer.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  saveTransfer(): void {
    this.calculateTotals();
    console.log('Saving transfer:', this.selectedTransfer);
    this.closeModal();
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Completed': 'badge-success',
      'In Transit': 'badge-info',
      'Pending': 'badge-warning',
      'Draft': 'badge-secondary'
    };
    return classes[status] || 'badge-info';
  }
}
