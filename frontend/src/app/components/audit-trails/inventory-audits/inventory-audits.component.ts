import { Component, OnInit } from '@angular/core';
import { AuditTrailService } from '../../../services/audit-trail.service';
import { AuditTrail, AuditAction } from '../../../models/audit-trail.model';

@Component({
  selector: 'app-inventory-audits',
  standalone: false,
  templateUrl: './inventory-audits.component.html',
  styleUrls: ['./inventory-audits.component.scss']
})
export class InventoryAuditsComponent implements OnInit {
  audits: AuditTrail[] = [];
  filteredAudits: AuditTrail[] = [];
  loading = false;
  
  searchTerm = '';
  selectedAction = '';
  selectedEntityType = '';
  startDate = '';
  endDate = '';
  
  actions: AuditAction[] = ['CREATED', 'UPDATED', 'DELETED', 'QUANTITY_MODIFIED', 'ITEM_ADDED', 'ITEM_REMOVED', 'STOCK_ISSUED', 'STOCK_TRANSFERRED'];
  entityTypes = ['Item', 'Group', 'Warehouse', 'Bin', 'Supplier', 'Unit', 'GRN', 'Stock Issue', 'Stock Transfer', 'Stock Adjustment'];

  constructor(private auditService: AuditTrailService) {}

  ngOnInit(): void {
    this.loadAudits();
  }

  loadAudits(): void {
    this.loading = true;
    this.auditService.getInventoryAudits().subscribe({
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
      case 'ITEM_ADDED': return 'badge-success';
      case 'UPDATED':
      case 'QUANTITY_MODIFIED': return 'badge-info';
      case 'DELETED':
      case 'ITEM_REMOVED': return 'badge-danger';
      case 'STOCK_ISSUED': return 'badge-warning';
      case 'STOCK_TRANSFERRED': return 'badge-primary';
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

  getChangeIndicator(audit: AuditTrail): string {
    if (audit.previousValue && audit.newValue) {
      return `${audit.previousValue} → ${audit.newValue}`;
    }
    return '-';
  }

  exportToExcel(): void {
    this.auditService.exportToExcel({ module: 'INVENTORY' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-audits-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    });
  }
}
