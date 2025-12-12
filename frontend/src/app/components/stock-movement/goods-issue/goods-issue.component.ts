import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';

interface IssueItem {
  itemName: string;
  description: string;
  requestedQty: number;
  issuedQty: number;
  uom: string;
}

interface GoodsIssue {
  id?: string;
  issueNumber: string;
  date: string;
  department: string;
  requestedBy: string;
  items: IssueItem[];
  totalQty: number;
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
  issueList: GoodsIssue[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedIssue: GoodsIssue = this.getEmptyIssue();
  loading: boolean = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.loading = true;
    this.issueList = [];
    this.loading = false;
  }

  getEmptyIssue(): GoodsIssue {
    return {
      issueNumber: '',
      date: new Date().toISOString().split('T')[0],
      department: '',
      requestedBy: '',
      items: [],
      totalQty: 0,
      status: 'Draft'
    };
  }

  getEmptyItem(): IssueItem {
    return {
      itemName: '',
      description: '',
      requestedQty: 0,
      issuedQty: 0,
      uom: ''
    };
  }

  openModal(issue?: GoodsIssue) {
    if (issue) {
      this.editMode = true;
      this.selectedIssue = { ...issue, items: [...issue.items] };
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
      next: (issueNumber) => {
        this.selectedIssue.issueNumber = issueNumber;
      },
      error: (err) => console.error('Error generating issue number', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedIssue = this.getEmptyIssue();
  }

  addItem(): void {
    this.selectedIssue.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedIssue.items.length > 1) {
      this.selectedIssue.items.splice(index, 1);
    }
  }

  calculateTotals(): void {
    this.selectedIssue.totalQty = this.selectedIssue.items.reduce((sum, item) => sum + item.issuedQty, 0);
  }

  saveIssue(): void {
    this.calculateTotals();
    console.log('Saving issue:', this.selectedIssue);
    this.closeModal();
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
