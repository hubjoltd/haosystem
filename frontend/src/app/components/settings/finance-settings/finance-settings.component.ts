import { Component } from '@angular/core';

@Component({
  selector: 'app-finance-settings',
  standalone: false,
  templateUrl: './finance-settings.component.html',
  styleUrls: ['./finance-settings.component.scss']
})
export class FinanceSettingsComponent {
  activeTab: string = 'tax';

  taxRates = [
    { id: 1, name: 'Standard VAT', rate: 20, type: 'VAT', status: 'Active' },
    { id: 2, name: 'Reduced VAT', rate: 5, type: 'VAT', status: 'Active' },
    { id: 3, name: 'Zero Rate', rate: 0, type: 'VAT', status: 'Active' },
    { id: 4, name: 'Service Tax', rate: 18, type: 'Service', status: 'Active' }
  ];

  currencies = [
    { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', isDefault: true },
    { id: 2, code: 'EUR', name: 'Euro', symbol: '€', isDefault: false },
    { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', isDefault: false },
    { id: 4, code: 'INR', name: 'Indian Rupee', symbol: '₹', isDefault: false }
  ];

  paymentModes = [
    { id: 1, name: 'Cash', description: 'Cash payment', status: 'Active' },
    { id: 2, name: 'Bank Transfer', description: 'Direct bank transfer', status: 'Active' },
    { id: 3, name: 'Credit Card', description: 'Credit/Debit card payment', status: 'Active' },
    { id: 4, name: 'Check', description: 'Payment by check', status: 'Active' }
  ];

  expenseCategories = [
    { id: 1, name: 'Office Supplies', description: 'Stationery and office materials' },
    { id: 2, name: 'Travel', description: 'Business travel expenses' },
    { id: 3, name: 'Utilities', description: 'Electricity, water, internet' },
    { id: 4, name: 'Marketing', description: 'Advertising and promotions' }
  ];

  showModal: boolean = false;
  modalType: string = '';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  openModal(type: string) {
    this.modalType = type;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
