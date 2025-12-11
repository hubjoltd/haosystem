import { Component } from '@angular/core';

@Component({
  selector: 'app-item-movement-report',
  standalone: false,
  templateUrl: './item-movement-report.component.html',
  styleUrls: ['./item-movement-report.component.scss']
})
export class ItemMovementReportComponent {
  reportData: any[] = [];
}
