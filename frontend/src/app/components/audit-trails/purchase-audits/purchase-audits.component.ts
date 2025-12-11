import { Component, OnInit } from '@angular/core';
import { AuditTrailService } from '../../../services/audit-trail.service';
import { AuditTrail, AuditAction } from '../../../models/audit-trail.model';

@Component({
  selector: 'app-purchase-audits',
  standalone: false,
  templateUrl: './purchase-audits.component.html',
  styleUrls: ['./purchase-audits.component.scss']
})
export class PurchaseAuditsComponent implements OnInit {
  audits: AuditTrail[] = [];
  filteredAudits: AuditTrail[] = [];
  loading = false;
  
  searchTerm = '';
  selectedAction = '';
  selectedEntityType = '';
  startDate = '';
  endDate = '';
  
  actions: AuditAction[] = [
    'CREATED', 'UPDATED', 'DELETED', 'SUBMITTED', 'APPROVED', 'REJECTED', 
    'CONVERTED_TO_PO', 'STOCK_ISSUED', 'STOCK_TRANSFERRED', 
    'QUANTITY_MODIFIED', 'ITEM_ADDED', 'ITEM_REMOVED', 'STATUS_CHANGED'
  ];
  entityTypes = ['Purchase Requisition', 'Purchase Order', 'Direct Purchase', 'PR Fulfillment'];

  constructor(private auditService: AuditTrailService) {}

  ngOnInit(): void {
    this.loadAudits();
  }

  loadAudits(): void {
    this.loading = true;
    this.auditService.getPurchaseAudits().subscribe({
      next: (data) => {
        this.audits = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.audits = [];
        this.filteredAudits = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredAudits = this.audits.filter(audit => {
      const matchesSearch = !this.searchTerm || 
        audit.entityName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        audit.performedBy?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        audit.details?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesAction = !this.selectedAction || audit.action === this.selectedAction;
      const matchesEntityType = !this.selectedEntityType || audit.entityType === this.selectedEntityType;
      const matchesDateRange = this.isWithinDateRange(audit.timestamp);
      
      return matchesSearch && matchesAction && matchesEntityType && matchesDateRange;
    });
  }

  isWithinDateRange(timestamp: string): boolean {
    if (!this.startDate && !this.endDate) return true;
    const auditDate = new Date(timestamp);
    if (this.startDate && auditDate < new Date(this.startDate)) return false;
    if (this.endDate && auditDate > new Date(this.endDate + 'T23:59:59')) return false;
    return true;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedAction = '';
    this.selectedEntityType = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'CREATED':
      case 'APPROVED': return 'badge-success';
      case 'UPDATED':
      case 'QUANTITY_MODIFIED':
      case 'STATUS_CHANGED': return 'badge-info';
      case 'DELETED':
      case 'REJECTED': return 'badge-danger';
      case 'SUBMITTED': return 'badge-warning';
      case 'CONVERTED_TO_PO': return 'badge-primary';
      case 'STOCK_ISSUED':
      case 'STOCK_TRANSFERRED': return 'badge-teal';
      default: return 'badge-secondary';
    }
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ');
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }

  getWorkflowIcon(action: string): string {
    switch (action) {
      case 'CREATED': return 'fa-plus-circle';
      case 'SUBMITTED': return 'fa-paper-plane';
      case 'APPROVED': return 'fa-check-circle';
      case 'REJECTED': return 'fa-times-circle';
      case 'CONVERTED_TO_PO': return 'fa-exchange-alt';
      case 'STOCK_ISSUED': return 'fa-arrow-right';
      case 'STOCK_TRANSFERRED': return 'fa-truck';
      case 'QUANTITY_MODIFIED': return 'fa-edit';
      default: return 'fa-history';
    }
  }

  exportToExcel(): void {
    this.auditService.exportToExcel({ module: 'PURCHASE' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase-audits-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    });
  }
}
