import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService, EmployeeDocument } from '../../../../services/document.service';

@Component({
  selector: 'app-document-expiry',
  standalone: false,
  templateUrl: './document-expiry.component.html',
  styleUrls: ['./document-expiry.component.scss']
})
export class DocumentExpiryComponent implements OnInit {
  expiringDocuments: EmployeeDocument[] = [];
  expiredDocuments: EmployeeDocument[] = [];
  pendingVerification: EmployeeDocument[] = [];
  
  activeTab: 'expiring' | 'expired' | 'pending' = 'expiring';
  expiryDays = 30;
  loading = false;

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = false;
    
    this.documentService.getExpiringDocuments(this.expiryDays).subscribe({
      next: (data) => this.expiringDocuments = data,
      error: (err) => console.error('Error loading expiring documents:', err)
    });

    this.documentService.getExpiredDocuments().subscribe({
      next: (data) => this.expiredDocuments = data,
      error: (err) => console.error('Error loading expired documents:', err)
    });

    this.documentService.getPendingVerification().subscribe({
      next: (data) => {
        this.pendingVerification = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pending verification:', err);
        this.loading = false;
      }
    });
  }

  onExpiryDaysChange() {
    this.documentService.getExpiringDocuments(this.expiryDays).subscribe({
      next: (data) => this.expiringDocuments = data,
      error: (err) => console.error('Error loading expiring documents:', err)
    });
  }

  setActiveTab(tab: 'expiring' | 'expired' | 'pending') {
    this.activeTab = tab;
  }

  getDaysUntilExpiry(expiryDate: string | undefined): number {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getExpiryClass(expiryDate: string | undefined): string {
    const days = this.getDaysUntilExpiry(expiryDate);
    if (days <= 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'normal';
  }

  verifyDocument(doc: EmployeeDocument, status: string) {
    if (!doc.id) return;
    
    const remarks = status === 'REJECTED' ? prompt('Enter rejection reason:') : '';
    
    this.documentService.verifyDocument(doc.id, status, remarks || undefined).subscribe({
      next: () => {
        alert(`Document ${status.toLowerCase()} successfully!`);
        this.loadData();
      },
      error: (err) => console.error('Error verifying document:', err)
    });
  }

  resetReminder(doc: EmployeeDocument) {
    if (!doc.id) return;
    
    this.documentService.resetReminder(doc.id).subscribe({
      next: () => {
        alert('Reminder reset successfully. Notification will be sent again when expiry approaches.');
        this.loadData();
      },
      error: (err) => console.error('Error resetting reminder:', err)
    });
  }

  runExpiryCheck() {
    this.documentService.checkExpiry().subscribe({
      next: (response) => {
        alert(`Expiry check completed. Processed: ${response.processed}, Notifications: ${response.notifications}`);
        this.loadData();
      },
      error: (err) => console.error('Error running expiry check:', err)
    });
  }

  viewEmployee(doc: EmployeeDocument) {
    if (doc.employee?.id) {
      this.router.navigate(['/app/hr/employees', doc.employee.id]);
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  }
}
