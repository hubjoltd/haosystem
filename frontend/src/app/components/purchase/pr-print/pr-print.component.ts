import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseRequisitionService, PurchaseRequisition } from '../../../services/purchase-requisition.service';

interface FulfillmentHistory {
  date: string;
  action: string;
  itemName: string;
  quantity: number;
  performedBy: string;
  reference: string;
}

@Component({
  selector: 'app-pr-print',
  standalone: false,
  templateUrl: './pr-print.component.html',
  styleUrls: ['./pr-print.component.scss']
})
export class PrPrintComponent implements OnInit {
  pr: PurchaseRequisition | null = null;
  prId: number = 0;
  loading: boolean = false;
  companyName: string = 'Hao System';
  companyAddress: string = '123 Business Street, City, Country';
  
  fulfillmentHistory: FulfillmentHistory[] = [];
  today: string = new Date().toISOString();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prService: PurchaseRequisitionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.prId = +params['id'];
      this.loadPR();
    });
  }

  loadPR(): void {
    this.prService.getById(this.prId).subscribe({
      next: (pr) => {
        this.pr = pr;
        this.loadFulfillmentHistory();
        this.loading = false;
        setTimeout(() => this.triggerPrint(), 500);
      },
      error: (err) => {
        console.error('Error loading PR:', err);
        this.loading = false;
      }
    });
  }

  loadFulfillmentHistory(): void {
    if (this.pr && this.pr.items) {
      this.fulfillmentHistory = this.pr.items
        .filter(item => (item.fulfilledQuantity || 0) > 0)
        .map(item => ({
          date: this.formatDate(new Date().toISOString()),
          action: item.status === 'Fully Fulfilled' ? 'Stock Issue' : 'Partial Fulfillment',
          itemName: item.itemName,
          quantity: item.fulfilledQuantity || 0,
          performedBy: 'System',
          reference: this.pr?.prNumber || ''
        }));
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getPendingQty(item: any): number {
    return Math.max(0, (item.quantity || 0) - (item.fulfilledQuantity || 0));
  }

  getTotalRequested(): number {
    if (!this.pr || !this.pr.items) return 0;
    return this.pr.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  getTotalFulfilled(): number {
    if (!this.pr || !this.pr.items) return 0;
    return this.pr.items.reduce((sum, item) => sum + (item.fulfilledQuantity || 0), 0);
  }

  getTotalPending(): number {
    return this.getTotalRequested() - this.getTotalFulfilled();
  }

  triggerPrint(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/app/purchase/requisition']);
  }
}
