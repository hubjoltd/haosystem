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
  companyName: string = 'ERP System';
  companyAddress: string = '123 Business Street, City, Country';
  companyPhone: string = '+1 234 567 8900';
  companyEmail: string = 'procurement@erp-system.com';
  
  deliveryAddress: string = 'Main Warehouse, 456 Industrial Zone, City, Country';
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
        this.loading = false;
        setTimeout(() => this.triggerPrint(), 500);
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
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  getItemAmount(item: DirectPurchaseItem): number {
    return (item.quantity || 0) * (item.rate || 0);
  }

  getSubtotal(): number {
    if (!this.po || !this.po.items) return 0;
    return this.po.items.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  getTaxAmount(): number {
    return this.getSubtotal() * 0.10;
  }

  getTotal(): number {
    if (this.po?.totalAmount) {
      return this.po.totalAmount;
    }
    return this.getSubtotal() + this.getTaxAmount();
  }

  triggerPrint(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/app/purchase/direct']);
  }
}
