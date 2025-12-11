import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory-valuation',
  standalone: false,
  templateUrl: './inventory-valuation.component.html',
  styleUrls: ['./inventory-valuation.component.scss']
})
export class InventoryValuationComponent {
  valuationMethods = [
    { id: 1, name: 'FIFO', description: 'First In First Out', active: true },
    { id: 2, name: 'LIFO', description: 'Last In First Out', active: false },
    { id: 3, name: 'Weighted Average', description: 'Average cost method', active: false },
    { id: 4, name: 'Standard Cost', description: 'Predetermined standard cost', active: false }
  ];

  valuationData = [
    { item: 'Laptop Dell XPS', quantity: 25, avgCost: 800, totalValue: 20000, method: 'FIFO' },
    { item: 'Office Chair', quantity: 40, avgCost: 150, totalValue: 6000, method: 'FIFO' },
    { item: 'A4 Paper Ream', quantity: 500, avgCost: 5, totalValue: 2500, method: 'Weighted Avg' },
    { item: 'Steel Sheet', quantity: 1000, avgCost: 2, totalValue: 2000, method: 'FIFO' },
    { item: 'Cardboard Box', quantity: 2000, avgCost: 0.5, totalValue: 1000, method: 'Weighted Avg' }
  ];

  totalValue: number = 31500;

  setValuationMethod(id: number) {
    this.valuationMethods.forEach(m => m.active = m.id === id);
  }
}
