import { Component, OnInit } from '@angular/core';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { ItemService } from '../../../services/item.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-group-wise-stock-report',
  standalone: false,
  templateUrl: './group-wise-stock-report.component.html',
  styleUrls: ['./group-wise-stock-report.component.scss']
})
export class GroupWiseStockReportComponent implements OnInit {
  reportData: any[] = [];
  groups: ItemGroup[] = [];
  selectedGroup: string = '';
  loading: boolean = true;  // Start with loading
dataReady: boolean = false;  // Only show content when ready
  totalQuantity: number = 0;
  totalValue: number = 0;

  constructor(
    private itemGroupService: ItemGroupService,
    private itemService: ItemService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.generateReport();
  }

  loadGroups(): void {
    this.itemGroupService.getAll().subscribe({
      next: (data) => this.groups = data,
      error: (err) => console.error('Error loading groups', err)
    });
  }

  generateReport(): void {
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: (data) => {
        const groupMap = new Map<string, { count: number; quantity: number; value: number }>();
        
        data.forEach(item => {
          const groupName = item.group?.name || 'Uncategorized';
          const current = groupMap.get(groupName) || { count: 0, quantity: 0, value: 0 };
          current.count++;
          current.quantity += item.currentStock || 0;
          current.value += (item.currentStock || 0) * (item.unitCost || 0);
          groupMap.set(groupName, current);
        });

        this.reportData = Array.from(groupMap.entries()).map(([group, data]) => ({
          group,
          itemsCount: data.count,
          totalQuantity: data.quantity,
          totalValue: data.value
        }));

        this.totalQuantity = this.reportData.reduce((sum, r) => sum + r.totalQuantity, 0);
        this.totalValue = this.reportData.reduce((sum, r) => sum + r.totalValue, 0);
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error generating report', err);
        this.completeLoading();
      }
    });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.reportData, 'group-wise-stock-report');
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.reportData, 'group-wise-stock-report', 'Group-wise Stock Report');
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.reportData, 'group-wise-stock-report');
  }
  completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
  }
}
