import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseInvoiceService, PurchaseInvoice, PurchaseInvoiceItem } from '../../../services/purchase-invoice.service';
import { DirectPurchaseService, DirectPurchase } from '../../../services/direct-purchase.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-purchase-invoice',
  standalone: false,
  templateUrl: './purchase-invoice.component.html',
  styleUrls: ['./purchase-invoice.component.scss']
})
export class PurchaseInvoiceComponent implements OnInit {
  invoices: PurchaseInvoice[] = [];
  completedPOs: DirectPurchase[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedInvoice: PurchaseInvoice = this.getEmptyInvoice();
  loading: boolean = false;
  viewMode: 'table' | 'kanban' = 'table';
  
  companyName: string = 'Hao System';
  companyGstin: string = '33APFSDF1ZV';
  companyAddress: string = 'No 23/2, SBI Colony, Ragavendra Nagar, Chennai - 600124';

  constructor(
    private invoiceService: PurchaseInvoiceService,
    private poService: DirectPurchaseService,
    private router: Router,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadCompletedPOs();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getAll().subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading invoices', err);
        this.loading = false;
      }
    });
  }

  loadCompletedPOs(): void {
    this.poService.getAll().subscribe({
      next: (data) => {
        this.completedPOs = data.filter(po => 
          po.status === 'Completed' || po.status === 'Approved'
        );
      },
      error: (err) => console.error('Error loading POs', err)
    });
  }

  get filteredInvoices() {
    if (!this.searchQuery) return this.invoices;
    const query = this.searchQuery.toLowerCase();
    return this.invoices.filter(inv => 
      inv.invoiceNumber?.toLowerCase().includes(query) ||
      inv.poNumber?.toLowerCase().includes(query) ||
      inv.supplierName?.toLowerCase().includes(query)
    );
  }

  get draftInvoices(): PurchaseInvoice[] {
    return this.filteredInvoices.filter(inv => inv.status === 'Draft');
  }

  get pendingInvoices(): PurchaseInvoice[] {
    return this.filteredInvoices.filter(inv => 
      inv.status === 'Pending' || inv.status === 'Submitted'
    );
  }

  get paidInvoices(): PurchaseInvoice[] {
    return this.filteredInvoices.filter(inv => 
      inv.status === 'Paid' || inv.status === 'Completed'
    );
  }

  getEmptyInvoice(): PurchaseInvoice {
    return {
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      billToName: this.companyName,
      billToAddress: this.companyAddress,
      billToGstin: this.companyGstin,
      shipToName: this.companyName,
      shipToAddress: this.companyAddress,
      items: []
    };
  }

  getEmptyItem(): PurchaseInvoiceItem {
    return {
      itemCode: '',
      itemName: '',
      description: '',
      hsnCode: '',
      quantity: 0,
      uom: 'nos',
      rate: 0,
      taxRate: 5,
      taxAmount: 0,
      amount: 0,
      remarks: ''
    };
  }

  openModal(invoice?: PurchaseInvoice): void {
    if (invoice) {
      this.editMode = true;
      this.selectedInvoice = { ...invoice, items: invoice.items ? [...invoice.items] : [] };
    } else {
      this.editMode = false;
      this.selectedInvoice = this.getEmptyInvoice();
      this.generateInvoiceNumber();
      this.addItem();
    }
    this.showModal = true;
  }

  generateInvoiceNumber(): void {
    this.settingsService.generatePrefixId('invoice').subscribe({
      next: (invNumber) => {
        this.selectedInvoice.invoiceNumber = invNumber;
      },
      error: () => {
        this.invoiceService.generateInvoiceNumber().subscribe({
          next: (invNumber) => {
            this.selectedInvoice.invoiceNumber = invNumber;
          },
          error: (err) => console.error('Error generating invoice number', err)
        });
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedInvoice = this.getEmptyInvoice();
  }

  addItem(): void {
    this.selectedInvoice.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedInvoice.items.length > 1) {
      this.selectedInvoice.items.splice(index, 1);
    }
  }

  calculateItemAmount(item: PurchaseInvoiceItem): void {
    const baseAmount = item.quantity * item.rate;
    item.taxAmount = baseAmount * (item.taxRate / 100);
    item.amount = baseAmount + item.taxAmount;
  }

  getSubtotal(): number {
    return this.selectedInvoice.items.reduce((sum, item) => 
      sum + (item.quantity * item.rate), 0);
  }

  getTaxTotal(): number {
    return this.selectedInvoice.items.reduce((sum, item) => 
      sum + (item.taxAmount || 0), 0);
  }

  getTotalAmount(): number {
    const subtotal = this.getSubtotal();
    const tax = this.getTaxTotal();
    const discount = this.selectedInvoice.discount || 0;
    return subtotal + tax - discount;
  }

  onPoSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const poId = +select.value;
    if (poId) {
      const po = this.completedPOs.find(p => p.id === poId);
      if (po) {
        this.selectedInvoice.poId = po.id;
        this.selectedInvoice.poNumber = po.poNumber;
        this.selectedInvoice.supplierId = po.supplierId;
        this.selectedInvoice.supplierName = po.supplierName;
        this.selectedInvoice.supplierAddress = po.supplierAddress;
        this.selectedInvoice.supplierContact = po.supplierContact;
        this.selectedInvoice.paymentTerms = po.paymentTerms;
        
        this.selectedInvoice.items = po.items.map(item => ({
          itemCode: item.itemCode || '',
          itemName: item.itemName,
          description: item.description,
          hsnCode: item.hsnCode || '',
          quantity: item.quantity,
          uom: item.uom || item.unit || 'nos',
          rate: item.rate,
          taxRate: item.taxRate || 5,
          taxAmount: 0,
          amount: 0,
          remarks: item.remarks
        }));
        
        this.selectedInvoice.items.forEach(item => this.calculateItemAmount(item));
      }
    }
  }

  saveInvoice(): void {
    this.selectedInvoice.subtotal = this.getSubtotal();
    this.selectedInvoice.taxAmount = this.getTaxTotal();
    this.selectedInvoice.totalAmount = this.getTotalAmount();

    if (this.editMode && this.selectedInvoice.id) {
      this.invoiceService.update(this.selectedInvoice.id, this.selectedInvoice).subscribe({
        next: () => {
          this.loadInvoices();
          this.closeModal();
        },
        error: (err) => console.error('Error updating invoice', err)
      });
    } else {
      this.invoiceService.create(this.selectedInvoice).subscribe({
        next: () => {
          this.loadInvoices();
          this.closeModal();
        },
        error: (err) => console.error('Error creating invoice', err)
      });
    }
  }

  deleteInvoice(id: number): void {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoiceService.delete(id).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Error deleting invoice', err)
      });
    }
  }

  updateInvoiceStatus(invoice: PurchaseInvoice, status: string): void {
    if (invoice.id) {
      this.invoiceService.updateStatus(invoice.id, status).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Error updating status', err)
      });
    }
  }

  printInvoice(invoice: PurchaseInvoice): void {
    if (invoice.id) {
      this.router.navigate(['/app/purchase/invoice', invoice.id, 'print']);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Paid':
      case 'Completed': return 'badge-success';
      case 'Pending':
      case 'Submitted': return 'badge-warning';
      case 'Draft': return 'badge-secondary';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'kanban' : 'table';
  }
}
