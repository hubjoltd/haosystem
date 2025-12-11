import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-inventory-valuation-report',
  standalone: false,
  templateUrl: './inventory-valuation-report.component.html',
  styleUrls: ['./inventory-valuation-report.component.scss']
})
export class InventoryValuationReportComponent implements OnInit {
  reportData: any[] = [];
  items: Item[] = [];
  totalValue: number = 0;
  loading: boolean = false;
  valuationMethod: string = 'cost';

  constructor(
    private itemService: ItemService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {}

  generateReport(): void {
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: (data) => {
        this.reportData = data.map(item => ({
          code: item.code,
          name: item.name,
          group: item.groupName,
          unit: item.unit,
          quantity: item.currentStock || 0,
          unitCost: item.costPrice || 0,
          totalValue: ((item.currentStock || 0) * (item.costPrice || 0))
        }));
        
        this.totalValue = this.reportData.reduce((sum, item) => sum + item.totalValue, 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'inventory-valuation-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'inventory-valuation-report', 'Inventory Valuation Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'inventory-valuation-report');
  }
}
