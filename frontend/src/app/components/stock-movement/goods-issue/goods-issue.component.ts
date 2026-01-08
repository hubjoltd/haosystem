import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { StockMovementService, GoodsIssue, GoodsIssueLine } from '../../../services/stock-movement.service';
import { ItemService } from '../../../services/item.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { NotificationService } from '../../../services/notification.service';

interface IssueItem {
  itemId?: number;
  itemName: string;
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  binId?: number;
}

interface Issue {
  id?: number;
  issueNumber: string;
  issueDate: string;
  warehouseId?: number;
  warehouse?: string;
  issueType?: string;
  referenceNumber?: string;
  items: IssueItem[];
  totalQty: number;
  totalValue: number;
  status: string;
  remarks?: string;
}

@Component({
  selector: 'app-goods-issue',
  standalone: false,
  templateUrl: './goods-issue.component.html',
  styleUrls: ['./goods-issue.component.scss']
})
export class GoodsIssueComponent implements OnInit {
  issueList: Issue[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedIssue: Issue = this.getEmptyIssue();
  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string = '';

  items: any[] = [];
  warehouses: any[] = [];
  issueTypes: string[] = ['Internal Use', 'Sales', 'Return', 'Damaged', 'Other'];

  constructor(
    private settingsService: SettingsService,
    private stockMovementService: StockMovementService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadIssues();
    this.loadMasterData();
  }

  loadMasterData(): void {
    this.itemService.getAll().subscribe({
      next: (data: any[]) => this.items = data,
      error: (err: any) => console.error('Error loading items', err)
    });
    this.warehouseService.getAll().subscribe({
      next: (data: any[]) => this.warehouses = data,
      error: (err: any) => console.error('Error loading warehouses', err)
    });
  }

  loadIssues(): void {
    this.loading = true;
    this.stockMovementService.getAllIssues().subscribe({
      next: (data: any[]) => {
        this.issueList = data.map(issue => ({
          id: issue.id,
          issueNumber: issue.issueNumber || '',
          issueDate: issue.issueDate || '',
          warehouseId: issue.warehouseId,
          warehouse: issue.warehouse || '',
          issueType: issue.issueType || '',
          referenceNumber: issue.referenceNumber || '',
          totalQty: issue.lines?.reduce((sum: number, line: any) => sum + (line.quantity || 0), 0) || 0,
          totalValue: issue.totalValue || 0,
          status: issue.status || 'Completed',
          remarks: issue.remarks || '',
          items: issue.lines?.map((line: any) => ({
            itemId: line.itemId,
            itemName: line.itemName || '',
            itemCode: line.itemCode || '',
            description: '',
            quantity: line.quantity || 0,
            unitPrice: line.unitPrice || 0,
            amount: line.lineTotal || 0
          })) || []
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading issues', err);
        this.issueList = [];
        this.loading = false;
      }
    });
  }

  getEmptyIssue(): Issue {
    return {
      issueNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      warehouseId: undefined,
      warehouse: '',
      issueType: 'Internal Use',
      referenceNumber: '',
      items: [],
      totalQty: 0,
      totalValue: 0,
      status: 'Draft',
      remarks: ''
    };
  }

  getEmptyItem(): IssueItem {
    return {
      itemId: undefined,
      itemName: '',
      itemCode: '',
      description: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0
    };
  }

  openModal(issue?: Issue) {
    this.errorMessage = '';
    if (issue) {
      this.editMode = true;
      this.selectedIssue = JSON.parse(JSON.stringify(issue));
    } else {
      this.editMode = false;
      this.selectedIssue = this.getEmptyIssue();
      this.generateIssueNumber();
      this.addItem();
    }
    this.showModal = true;
  }

  generateIssueNumber(): void {
    this.settingsService.generatePrefixId('issue').subscribe({
      next: (issueNumber: string) => {
        this.selectedIssue.issueNumber = issueNumber;
      },
      error: (err: any) => console.error('Error generating issue number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedIssue = this.getEmptyIssue();
    this.errorMessage = '';
  }

  addItem(): void {
    this.selectedIssue.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedIssue.items.length > 1) {
      this.selectedIssue.items.splice(index, 1);
      this.calculateTotals();
    }
  }

  onItemSelect(index: number): void {
    const selectedItem = this.items.find(i => i.id === this.selectedIssue.items[index].itemId);
    if (selectedItem) {
      this.selectedIssue.items[index].itemName = selectedItem.name;
      this.selectedIssue.items[index].itemCode = selectedItem.code;
      this.selectedIssue.items[index].description = selectedItem.description || '';
      this.selectedIssue.items[index].unitPrice = selectedItem.unitCost || 0;
      this.calculateItemAmount(this.selectedIssue.items[index]);
    }
  }

  calculateItemAmount(item: IssueItem): void {
    item.amount = item.quantity * item.unitPrice;
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.selectedIssue.totalQty = this.selectedIssue.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    this.selectedIssue.totalValue = this.selectedIssue.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  saveIssue(): void {
    this.calculateTotals();
    
    const validItems = this.selectedIssue.items.filter(item => item.itemId && item.quantity > 0);
    if (validItems.length === 0) {
      this.notificationService.error('Please add at least one item with quantity.');
      return;
    }

    if (!this.selectedIssue.warehouseId) {
      this.notificationService.error('Please select a warehouse.');
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      issueDate: this.selectedIssue.issueDate,
      warehouseId: this.selectedIssue.warehouseId,
      issueType: this.selectedIssue.issueType,
      referenceNumber: this.selectedIssue.referenceNumber,
      remarks: this.selectedIssue.remarks,
      lines: validItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        binId: item.binId
      }))
    };

    this.stockMovementService.createIssue(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success('Goods Issue created successfully');
        this.loadIssues();
        this.closeModal();
      },
      error: (err: any) => {
        this.saving = false;
        this.notificationService.error(err.error?.error || 'Error saving issue');
        console.error('Error saving issue', err);
      }
    });
  }

  deleteIssue(id: number): void {
    if (confirm('Are you sure you want to delete this issue?')) {
      this.stockMovementService.deleteIssue(id).subscribe({
        next: () => this.loadIssues(),
        error: (err: any) => console.error('Error deleting issue', err)
      });
    }
  }

  getTotalValue(): number {
    return this.issueList.reduce((sum, issue) => sum + (issue.totalValue || 0), 0);
  }

  getCompletedCount(): number {
    return this.issueList.filter(issue => issue.status === 'Completed').length;
  }

  getPendingCount(): number {
    return this.issueList.filter(issue => issue.status === 'Pending' || issue.status === 'Draft').length;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Draft': 'badge-info'
    };
    return classes[status] || 'badge-info';
  }
}
