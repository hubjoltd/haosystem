import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-adjustments',
  standalone: false,
  templateUrl: './stock-adjustments.component.html',
  styleUrls: ['./stock-adjustments.component.scss']
})
export class StockAdjustmentsComponent {
  adjustments: any[] = [];
  showModal: boolean = false;

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }
}
