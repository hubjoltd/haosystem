import { Component } from '@angular/core';

@Component({
  selector: 'app-slow-moving-items-report',
  standalone: false,
  templateUrl: './slow-moving-items-report.component.html',
  styleUrls: ['./slow-moving-items-report.component.scss']
})
export class SlowMovingItemsReportComponent {
  reportData: any[] = [];
}
