import { Component, OnInit } from '@angular/core';
import { AuditTrailService } from '../../../services/audit-trail.service';
import { AuditTrail, AuditAction } from '../../../models/audit-trail.model';

@Component({
  selector: 'app-system-audits',
  standalone: false,
  templateUrl: './system-audits.component.html',
  styleUrls: ['./system-audits.component.scss']
})
export class SystemAuditsComponent implements OnInit {
  audits: AuditTrail[] = [];
  filteredAudits: AuditTrail[] = [];
  loading = false;
  
  searchTerm = '';
  selectedAction = '';
  startDate = '';
  endDate = '';
  
  actions: AuditAction[] = ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGED', 'SETTINGS_UPDATED', 'CREATED', 'UPDATED', 'DELETED'];

  constructor(private auditService: AuditTrailService) {}

  ngOnInit(): void {
    this.loadAudits();
  }

  loadAudits(): void {
    this.loading = false;
    this.auditService.getSystemAudits().subscribe({
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
      
      const matchesDateRange = this.isWithinDateRange(audit.timestamp);
      
      return matchesSearch && matchesAction && matchesDateRange;
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
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'CREATED':
      case 'LOGIN': return 'badge-success';
      case 'UPDATED':
      case 'SETTINGS_UPDATED': return 'badge-info';
      case 'DELETED':
      case 'LOGOUT': return 'badge-warning';
      case 'PASSWORD_CHANGED': return 'badge-primary';
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

  exportToExcel(): void {
    this.auditService.exportToExcel({ module: 'SYSTEM' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-audits-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    });
  }
}
