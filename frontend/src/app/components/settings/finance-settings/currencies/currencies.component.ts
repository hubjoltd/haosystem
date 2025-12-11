import { Component, OnInit } from '@angular/core';

interface Currency {
  id?: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  status: string;
}

@Component({
  selector: 'app-currencies',
  standalone: false,
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.scss']
})
export class CurrenciesComponent implements OnInit {
  currencies: Currency[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedCurrency: Currency = this.getEmptyCurrency();
  loading: boolean = false;

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.loading = false;
  }

  getEmptyCurrency(): Currency {
    return {
      code: '',
      name: '',
      symbol: '',
      exchangeRate: 1,
      isDefault: false,
      status: 'Active'
    };
  }

  openModal(currency?: Currency) {
    if (currency) {
      this.editMode = true;
      this.selectedCurrency = { ...currency };
    } else {
      this.editMode = false;
      this.selectedCurrency = this.getEmptyCurrency();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCurrency = this.getEmptyCurrency();
  }

  saveCurrency(): void {
    if (this.editMode) {
      const index = this.currencies.findIndex(c => c.id === this.selectedCurrency.id);
      if (index !== -1) {
        this.currencies[index] = { ...this.selectedCurrency };
      }
    } else {
      this.selectedCurrency.id = Date.now();
      this.currencies.push({ ...this.selectedCurrency });
    }
    this.closeModal();
  }

  deleteCurrency(id: number): void {
    if (confirm('Are you sure you want to delete this currency?')) {
      this.currencies = this.currencies.filter(c => c.id !== id);
    }
  }
}
