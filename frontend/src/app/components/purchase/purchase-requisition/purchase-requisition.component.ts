import { Component, OnInit } from '@angular/core';
import { PurchaseRequisitionService, PurchaseRequisition, PRItem } from '../../../services/purchase-requisition.service';
import { UnitOfMeasureService, UnitOfMeasure } from '../../../services/unit-of-measure.service';
import { ItemService, Item } from '../../../services/item.service';

@Component({
  selector: 'app-purchase-requisition',
  standalone: false,
  templateUrl: './purchase-requisition.component.html',
  styleUrls: ['./purchase-requisition.component.scss']
})
export class PurchaseRequisitionComponent implements OnInit {
  requisitions: PurchaseRequisition[] = [];
  draftPRs: PurchaseRequisition[] = [];
  submittedPRs: PurchaseRequisition[] = [];
  approvedPRs: PurchaseRequisition[] = [];
  
  units: UnitOfMeasure[] = [];
  items: Item[] = [];
  
  showModal = false;
  isEditing = false;
  searchTerm = '';
  viewMode: 'kanban' | 'table' = 'kanban';
  
  selectedPR: PurchaseRequisition = this.getEmptyPR();
  
  sortOptions = [
    { value: 'date-created', label: 'Date Created' },
    { value: 'pr-date', label: 'PR Date' },
    { value: 'priority', label: 'Priority' }
  ];
  currentSort = 'date-created';

  constructor(
    private prService: PurchaseRequisitionService,
    private unitService: UnitOfMeasureService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.prService.getAll().subscribe({
      next: (data) => {
        this.requisitions = data;
        this.filterByStatus();
      },
      error: () => {
        this.requisitions = [];
        this.filterByStatus();
      }
    });
    
    this.unitService.getActive().subscribe({
      next: (data) => this.units = data,
      error: () => this.units = []
    });
    
    this.itemService.getActive().subscribe({
      next: (data) => this.items = data,
      error: () => this.items = []
    });
  }

  filterByStatus(): void {
    this.draftPRs = this.requisitions.filter(pr => pr.status === 'Draft');
    this.submittedPRs = this.requisitions.filter(pr => pr.status === 'Submitted');
    this.approvedPRs = this.requisitions.filter(pr => pr.status === 'Approved');
  }

  getFilteredPRs(list: PurchaseRequisition[]): PurchaseRequisition[] {
    if (!this.searchTerm) return list;
    const term = this.searchTerm.toLowerCase();
    return list.filter(pr => 
      pr.prNumber?.toLowerCase().includes(term) ||
      pr.department?.toLowerCase().includes(term) ||
      pr.requestedBy?.toLowerCase().includes(term)
    );
  }

  getEmptyPR(): PurchaseRequisition {
    const today = new Date().toISOString().split('T')[0];
    return {
      prNumber: this.prService?.generatePRNumber() || '',
      prDate: today,
      requiredDate: '',
      requestedBy: 'Current User',
      department: '',
      deliveryLocation: '',
      purpose: '',
      priority: 'Normal',
      status: 'Draft',
      items: [this.getEmptyItem()],
      commentsCount: 0
    };
  }

  getEmptyItem(): PRItem {
    return {
      itemName: '',
      itemDescription: '',
      quantity: 0,
      uom: '',
      remarks: ''
    };
  }

  openNewModal(): void {
    this.isEditing = false;
    this.selectedPR = this.getEmptyPR();
    this.selectedPR.prNumber = this.prService.generatePRNumber();
    this.showModal = true;
  }

  openEditModal(pr: PurchaseRequisition): void {
    this.isEditing = true;
    this.selectedPR = JSON.parse(JSON.stringify(pr));
    if (!this.selectedPR.items || this.selectedPR.items.length === 0) {
      this.selectedPR.items = [this.getEmptyItem()];
    }
    this.showModal = true;
  }

  viewPR(pr: PurchaseRequisition): void {
    this.openEditModal(pr);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPR = this.getEmptyPR();
  }

  addItem(): void {
    this.selectedPR.items.push(this.getEmptyItem());
  }

  removeItem(index: number): void {
    if (this.selectedPR.items.length > 1) {
      this.selectedPR.items.splice(index, 1);
    }
  }

  onItemSelect(index: number): void {
    const selectedItem = this.items.find(i => i.name === this.selectedPR.items[index].itemName);
    if (selectedItem) {
      this.selectedPR.items[index].itemDescription = selectedItem.description || '';
      this.selectedPR.items[index].uom = selectedItem.unitOfMeasure?.symbol || selectedItem.unitOfMeasure?.code || '';
    }
  }

  saveDraft(): void {
    this.selectedPR.status = 'Draft';
    this.saveRequisition();
  }

  submitPR(): void {
    this.selectedPR.status = 'Submitted';
    this.saveRequisition();
  }

  saveRequisition(): void {
    const validItems = this.selectedPR.items.filter(item => item.itemName && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item with name and quantity.');
      return;
    }
    this.selectedPR.items = validItems;

    if (this.isEditing && this.selectedPR.id) {
      this.prService.update(this.selectedPR.id, this.selectedPR).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error updating PR:', err)
      });
    } else {
      this.prService.create(this.selectedPR).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error creating PR:', err)
      });
    }
  }

  deletePR(pr: PurchaseRequisition): void {
    if (pr.status !== 'Draft') {
      alert('Only Draft PRs can be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${pr.prNumber}?`)) {
      if (pr.id) {
        this.prService.delete(pr.id).subscribe({
          next: () => this.loadData(),
          error: (err) => console.error('Error deleting PR:', err)
        });
      }
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'priority-critical';
      case 'Urgent': return 'priority-urgent';
      default: return 'priority-normal';
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  canEdit(pr: PurchaseRequisition): boolean {
    return pr.status === 'Draft';
  }

  canDelete(pr: PurchaseRequisition): boolean {
    return pr.status === 'Draft';
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'kanban' ? 'table' : 'kanban';
  }

  getAllFilteredPRs(): PurchaseRequisition[] {
    if (!this.searchTerm) return this.requisitions;
    const term = this.searchTerm.toLowerCase();
    return this.requisitions.filter(pr => 
      pr.prNumber?.toLowerCase().includes(term) ||
      pr.department?.toLowerCase().includes(term) ||
      pr.requestedBy?.toLowerCase().includes(term)
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Submitted': return 'status-submitted';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return 'status-default';
    }
  }
}
