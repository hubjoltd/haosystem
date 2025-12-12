import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../../services/item.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-slow-moving-items-report',
  standalone: false,
  templateUrl: './slow-moving-items-report.component.html',
  styleUrls: ['./slow-moving-items-report.component.scss']
})
export class SlowMovingItemsReportComponent implements OnInit {
  reportData: any[] = [];
  daysWithoutMovement: number = 30;
  loading: boolean = false;
  totalValue: number = 0;

  constructor(
    private itemService: ItemService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {}

  generateReport(): void {
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: (data) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.daysWithoutMovement);

        this.reportData = data
          .filter((item: any) => {
            const lastMovement = item.lastMovementDate ? new Date(item.lastMovementDate) : null;
            return !lastMovement || lastMovement < cutoffDate;
          })
          .map((item: any) => ({
            code: item.code,
            name: item.name,
            lastMovement: item.lastMovementDate || 'Never',
            daysIdle: item.lastMovementDate 
              ? Math.floor((new Date().getTime() - new Date(item.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24))
              : 'N/A',
            currentStock: item.currentStock || 0,
            value: (item.currentStock || 0) * (item.unitCost || 0)
          }));

        this.totalValue = this.reportData.reduce((sum, r) => sum + r.value, 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'slow-moving-items-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'slow-moving-items-report', 'Slow / Non-Moving Items Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'slow-moving-items-report');
  }
}
