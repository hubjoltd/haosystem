import { Component, OnInit } from '@angular/core';

interface PaymentMode {
  id?: number;
  name: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-payment-modes',
  standalone: false,
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.scss']
})
export class PaymentModesComponent implements OnInit {
  paymentModes: PaymentMode[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedPaymentMode: PaymentMode = this.getEmptyPaymentMode();
  loading: boolean = false;

  ngOnInit(): void {
    this.loadPaymentModes();
  }

  loadPaymentModes(): void {
    this.loading = false;
  }

  getEmptyPaymentMode(): PaymentMode {
    return {
      name: '',
      description: '',
      status: 'Active'
    };
  }

  openModal(paymentMode?: PaymentMode) {
    if (paymentMode) {
      this.editMode = true;
      this.selectedPaymentMode = { ...paymentMode };
    } else {
      this.editMode = false;
      this.selectedPaymentMode = this.getEmptyPaymentMode();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPaymentMode = this.getEmptyPaymentMode();
  }

  savePaymentMode(): void {
    if (this.editMode) {
      const index = this.paymentModes.findIndex(p => p.id === this.selectedPaymentMode.id);
      if (index !== -1) {
        this.paymentModes[index] = { ...this.selectedPaymentMode };
      }
    } else {
      this.selectedPaymentMode.id = Date.now();
      this.paymentModes.push({ ...this.selectedPaymentMode });
    }
    this.closeModal();
  }

  deletePaymentMode(id: number): void {
    if (confirm('Are you sure you want to delete this payment mode?')) {
      this.paymentModes = this.paymentModes.filter(p => p.id !== id);
    }
  }
}
