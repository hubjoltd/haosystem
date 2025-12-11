import { Component } from '@angular/core';

@Component({
  selector: 'app-group-wise-stock-report',
  standalone: false,
  templateUrl: './group-wise-stock-report.component.html',
  styleUrls: ['./group-wise-stock-report.component.scss']
})
export class GroupWiseStockReportComponent {
  reportData: any[] = [];
}
