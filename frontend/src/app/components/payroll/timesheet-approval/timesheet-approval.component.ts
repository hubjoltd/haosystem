import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, Timesheet, PayFrequency } from '../../../services/payroll.service';

@Component({
  selector: 'app-timesheet-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet-approval.component.html',
  styleUrls: ['./timesheet-approval.component.scss']
})
export class TimesheetApprovalComponent implements OnInit {
  timesheets: Timesheet[] = [];
  filteredTimesheets: Timesheet[] = [];
  payFrequencies: PayFrequency[] = [];
  
  filterStatus = 'ALL';
  startDate = '';
  endDate = '';
  
  showGenerateModal = false;
  generateStartDate = '';
  generateEndDate = '';
  generating = false;

  statusOptions = ['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadTimesheets();
    this.loadPayFrequencies();
  }

  setDefaultDates(): void {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.startDate = firstOfMonth.toISOString().split('T')[0];
    this.endDate = lastOfMonth.toISOString().split('T')[0];
    this.generateStartDate = this.startDate;
    this.generateEndDate = this.endDate;
  }

  loadTimesheets(): void {
    this.payrollService.getTimesheets().subscribe({
      next: (data) => {
        this.timesheets = data;
        this.filterTimesheets();
      },
      error: (err) => console.error('Error loading timesheets:', err)
    });
  }

  loadPayFrequencies(): void {
    this.payrollService.getPayFrequencies().subscribe({
      next: (data) => this.payFrequencies = data,
      error: (err) => console.error('Error loading pay frequencies:', err)
    });
  }

  filterTimesheets(): void {
    this.filteredTimesheets = this.timesheets.filter(t => {
      const statusMatch = this.filterStatus === 'ALL' || t.status === this.filterStatus;
      return statusMatch;
    });
  }

  openGenerateModal(): void {
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
  }

  generateTimesheets(): void {
    if (!this.generateStartDate || !this.generateEndDate) return;
    
    this.generating = true;
    this.payrollService.generateTimesheets(this.generateStartDate, this.generateEndDate).subscribe({
      next: (result) => {
        this.generating = false;
        this.closeGenerateModal();
        this.loadTimesheets();
        alert(`Generated ${result.generated} timesheets`);
      },
      error: (err) => {
        this.generating = false;
        console.error('Error generating timesheets:', err);
        alert('Error generating timesheets');
      }
    });
  }

  approveTimesheet(id: number): void {
    this.payrollService.approveTimesheet(id, {}).subscribe({
      next: () => this.loadTimesheets(),
      error: (err) => console.error('Error approving timesheet:', err)
    });
  }

  rejectTimesheet(id: number): void {
    const remarks = prompt('Enter rejection reason:');
    if (remarks === null) return;
    
    this.payrollService.rejectTimesheet(id, { approverRemarks: remarks }).subscribe({
      next: () => this.loadTimesheets(),
      error: (err) => console.error('Error rejecting timesheet:', err)
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING_APPROVAL': return 'pending';
      default: return 'draft';
    }
  }

  getEmployeeName(timesheet: Timesheet): string {
    if (timesheet.employee) {
      return `${timesheet.employee.firstName || ''} ${timesheet.employee.lastName || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  }

  getCountByStatus(status: string): number {
    return this.timesheets.filter(t => t.status === status).length;
  }
}
