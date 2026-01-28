import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-supplier',
  standalone: false,
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
  suppliers: Supplier[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedSupplier: Supplier = this.getEmptySupplier();
  loading: boolean = false;

  constructor(
    private supplierService: SupplierService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading suppliers', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredSuppliers() {
    if (!this.searchQuery) return this.suppliers;
    return this.suppliers.filter(s => 
      s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getEmptySupplier(): Supplier {
    return {
      code: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: '',
      status: 'Active'
    };
  }

  openModal(supplier?: Supplier) {
    if (supplier) {
      this.editMode = true;
      this.selectedSupplier = { ...supplier };
    } else {
      this.editMode = false;
      this.selectedSupplier = this.getEmptySupplier();
      this.generateSupplierCode();
    }
    this.showModal = true;
  }

  generateSupplierCode(): void {
    this.settingsService.previewPrefixId('supplier').subscribe({
      next: (code) => {
        this.selectedSupplier.code = code;
      },
      error: (err) => console.error('Error generating supplier code', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedSupplier = this.getEmptySupplier();
  }

  saveSupplier(): void {
    if (this.editMode && this.selectedSupplier.id) {
      this.supplierService.update(this.selectedSupplier.id, this.selectedSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
        error: (err) => console.error('Error updating supplier', err)
      });
    } else {
      this.supplierService.create(this.selectedSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
        error: (err) => console.error('Error creating supplier', err)
      });
    }
  }

  deleteSupplier(id: number): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.delete(id).subscribe({
        next: () => this.loadSuppliers(),
        error: (err) => console.error('Error deleting supplier', err)
      });
    }
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'badge-success' : 'badge-danger';
  }
}
