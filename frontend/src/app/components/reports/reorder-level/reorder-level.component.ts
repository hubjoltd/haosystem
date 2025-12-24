import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-reorder-level',
  standalone: false,
  templateUrl: './reorder-level.component.html',
  styleUrls: ['./reorder-level.component.scss']
})
export class ReorderLevelComponent implements OnInit {
  reportData: any[] = [];
  loading: boolean = false;

  constructor(
    private itemService: ItemService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    this.loading = false;
    this.itemService.getLowStock().subscribe({
      next: (data) => {
        this.reportData = data.map(item => ({
          code: item.code,
          name: item.name,
          group: item.group?.name || '',
          unit: item.unitOfMeasure?.name || '',
          currentStock: item.currentStock || 0,
          reorderLevel: item.reorderLevel || 0,
          shortage: (item.reorderLevel || 0) - (item.currentStock || 0),
          status: (item.currentStock || 0) <= 0 ? 'Out of Stock' : 
                  (item.currentStock || 0) <= (item.reorderLevel || 0) / 2 ? 'Critical' : 'Low Stock'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'reorder-level-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'reorder-level-report', 'Reorder Level Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'reorder-level-report');
  }

  getStatusClass(status: string): string {
    if (status === 'Out of Stock') return 'badge-danger';
    if (status === 'Critical') return 'badge-warning';
    return 'badge-info';
  }
}
