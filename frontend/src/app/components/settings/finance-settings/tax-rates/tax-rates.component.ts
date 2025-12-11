import { Component, OnInit } from '@angular/core';

interface TaxRate {
  id?: number;
  name: string;
  rate: number;
  description: string;
  status: string;
}

@Component({
  selector: 'app-tax-rates',
  standalone: false,
  templateUrl: './tax-rates.component.html',
  styleUrls: ['./tax-rates.component.scss']
})
export class TaxRatesComponent implements OnInit {
  taxRates: TaxRate[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedTaxRate: TaxRate = this.getEmptyTaxRate();
  loading: boolean = false;

  ngOnInit(): void {
    this.loadTaxRates();
  }

  loadTaxRates(): void {
    this.loading = false;
  }

  getEmptyTaxRate(): TaxRate {
    return {
      name: '',
      rate: 0,
      description: '',
      status: 'Active'
    };
  }

  openModal(taxRate?: TaxRate) {
    if (taxRate) {
      this.editMode = true;
      this.selectedTaxRate = { ...taxRate };
    } else {
      this.editMode = false;
      this.selectedTaxRate = this.getEmptyTaxRate();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedTaxRate = this.getEmptyTaxRate();
  }

  saveTaxRate(): void {
    if (this.editMode) {
      const index = this.taxRates.findIndex(t => t.id === this.selectedTaxRate.id);
      if (index !== -1) {
        this.taxRates[index] = { ...this.selectedTaxRate };
      }
    } else {
      this.selectedTaxRate.id = Date.now();
      this.taxRates.push({ ...this.selectedTaxRate });
    }
    this.closeModal();
  }

  deleteTaxRate(id: number): void {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      this.taxRates = this.taxRates.filter(t => t.id !== id);
    }
  }
}
