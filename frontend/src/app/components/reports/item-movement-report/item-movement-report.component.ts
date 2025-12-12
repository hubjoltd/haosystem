import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from '../../../services/item.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-item-movement-report',
  standalone: false,
  templateUrl: './item-movement-report.component.html',
  styleUrls: ['./item-movement-report.component.scss']
})
export class ItemMovementReportComponent implements OnInit {
  reportData: any[] = [];
  items: Item[] = [];
  selectedItem: string = '';
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = false;

  constructor(
    private itemService: ItemService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getAll().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error('Error loading items', err)
    });
  }

  generateReport(): void {
    this.loading = true;
    setTimeout(() => {
      this.reportData = [];
      this.loading = false;
    }, 500);
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'item-movement-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'item-movement-report', 'Item Movement Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'item-movement-report');
  }
}
