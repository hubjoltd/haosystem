import { Component } from '@angular/core';

@Component({
  selector: 'app-units-of-measure',
  standalone: false,
  templateUrl: './units-of-measure.component.html',
  styleUrls: ['./units-of-measure.component.scss']
})
export class UnitsOfMeasureComponent {
  units = [
    { id: 1, code: 'PCS', name: 'Pieces', description: 'Individual pieces', baseUnit: true },
    { id: 2, code: 'KG', name: 'Kilogram', description: 'Weight in kilograms', baseUnit: true },
    { id: 3, code: 'LTR', name: 'Liter', description: 'Volume in liters', baseUnit: true },
    { id: 4, code: 'MTR', name: 'Meter', description: 'Length in meters', baseUnit: true },
    { id: 5, code: 'BOX', name: 'Box', description: 'Box of items', baseUnit: false },
    { id: 6, code: 'DZN', name: 'Dozen', description: '12 pieces', baseUnit: false },
    { id: 7, code: 'REAM', name: 'Ream', description: '500 sheets', baseUnit: false }
  ];

  showModal: boolean = false;
  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }
}
