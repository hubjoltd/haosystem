import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DirectPurchaseService, DirectPurchase, DirectPurchaseItem } from '../../../services/direct-purchase.service';

@Component({
  selector: 'app-po-print',
  standalone: false,
  templateUrl: './po-print.component.html',
  styleUrls: ['./po-print.component.scss']
})
export class PoPrintComponent implements OnInit {
  po: DirectPurchase | null = null;
  poId: number = 0;
  loading: boolean = true;
  
  companyName: string = 'Thendral Supermarket';
  companyTagline: string = 'Supermarket';
  companyAddress: string = 'No 23/2, SBI Colony, Ragavendra Nagar, Chennai - 600124';
  companyPhone: string = '+91-7869825463';
  companyEmail: string = 'purchase-team@thendral.com';
  companyGstin: string = '33APFSDF1ZV';
  
  billToAddress: string = 'No 23/2, SBI Colony.\nRagavendra Nagar, Chennai - 600124';
  shipToAddress: string = 'No 23/2, SBI Colony.\nRagavendra Nagar, Chennai - 600124';
  
  supplierCode: string = 'VNDR-104';
  supplierGstin: string = '33AACCEPVS1ZH';
  supplierEmail: string = 'purchase-sm@gmail.com';
  
  poExpiryDays: number = 7;
  paymentDateText: string = '7 days from date of delivery';
  defaultTaxRate: number = 5;
  discount: number = 0;
  
  today: string = new Date().toISOString();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poService: DirectPurchaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.poId = +params['id'];
      this.loadPO();
    });
  }

  loadPO(): void {
    this.poService.getById(this.poId).subscribe({
      next: (po) => {
        this.po = po;
        if (po.supplierId) {
          this.supplierCode = 'VNDR-' + po.supplierId;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading PO:', err);
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatNumber(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  getDefaultHsn(item: DirectPurchaseItem): string {
    return '34019011';
  }

  getItemAmount(item: DirectPurchaseItem): number {
    const baseAmount = (item.quantity || 0) * (item.rate || 0);
    const taxRate = (item as any).taxRate || this.defaultTaxRate;
    const taxAmount = baseAmount * (taxRate / 100);
    return baseAmount + taxAmount;
  }

  getSubtotal(): number {
    if (!this.po || !this.po.items) return 0;
    return this.po.items.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  getGrandTotal(): number {
    return this.getSubtotal() - this.discount;
  }

  triggerPrint(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/app/purchase/direct']);
  }
}
