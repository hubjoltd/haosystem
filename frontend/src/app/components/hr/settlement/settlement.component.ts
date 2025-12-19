import { Component, OnInit } from '@angular/core';
import { SettlementService } from '../../../services/settlement.service';
import { EmployeeService } from '../../../services/employee.service';

@Component({
  selector: 'app-settlement',
  standalone: false,
  templateUrl: './settlement.component.html',
  styleUrls: ['./settlement.component.scss']
})
export class SettlementComponent implements OnInit {
  settlements: any[] = [];
  employees: any[] = [];
  dashboard: any = {};
  loading = false;
  showForm = false;
  showDetail = false;
  selectedSettlement: any = null;
  formData: any = {};
  separationTypes = ['RESIGNATION', 'TERMINATION', 'RETIREMENT', 'CONTRACT_END', 'MUTUAL_SEPARATION'];

  constructor(
    private settlementService: SettlementService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadSettlements();
    this.loadEmployees();
  }

  loadDashboard(): void {
    this.settlementService.getDashboard().subscribe({
      next: (data) => this.dashboard = data,
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  loadSettlements(): void {
    this.loading = true;
    this.settlementService.getAll().subscribe({
      next: (data) => { this.settlements = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  openForm(): void {
    this.formData = {
      employeeId: '',
      lastWorkingDay: new Date().toISOString().split('T')[0],
      separationType: 'RESIGNATION'
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.formData = {};
  }

  saveSettlement(): void {
    if (!this.formData.employeeId || !this.formData.lastWorkingDay) {
      alert('Please select an employee and last working day');
      return;
    }
    this.settlementService.initiateSettlement(this.formData).subscribe({
      next: () => { this.closeForm(); this.loadSettlements(); this.loadDashboard(); },
      error: (err) => { console.error(err); alert(err.error?.error || 'Error initiating settlement'); }
    });
  }

  viewDetail(settlement: any): void {
    this.selectedSettlement = settlement;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedSettlement = null;
  }

  submitSettlement(id: number): void {
    if (confirm('Submit this settlement for approval?')) {
      this.settlementService.submit(id).subscribe({
        next: () => { this.loadSettlements(); this.loadDashboard(); this.closeDetail(); },
        error: (err) => { console.error(err); alert(err.error?.error || 'Error submitting settlement'); }
      });
    }
  }

  approveSettlement(id: number): void {
    if (confirm('Approve this settlement?')) {
      this.settlementService.approve(id, 'Admin').subscribe({
        next: () => { this.loadSettlements(); this.loadDashboard(); this.closeDetail(); },
        error: (err) => { console.error(err); alert(err.error?.error || 'Error approving settlement'); }
      });
    }
  }

  rejectSettlement(id: number): void {
    const remarks = prompt('Enter rejection reason:');
    if (remarks) {
      this.settlementService.reject(id, remarks).subscribe({
        next: () => { this.loadSettlements(); this.loadDashboard(); this.closeDetail(); },
        error: (err) => { console.error(err); alert(err.error?.error || 'Error rejecting settlement'); }
      });
    }
  }

  processSettlement(id: number): void {
    if (confirm('Process this settlement for payment?')) {
      this.settlementService.process(id, 'Admin').subscribe({
        next: () => { this.loadSettlements(); this.loadDashboard(); this.closeDetail(); },
        error: (err) => { console.error(err); alert(err.error?.error || 'Error processing settlement'); }
      });
    }
  }

  deleteSettlement(id: number): void {
    if (confirm('Delete this draft settlement?')) {
      this.settlementService.delete(id).subscribe({
        next: () => { this.loadSettlements(); this.loadDashboard(); },
        error: (err) => { console.error(err); alert(err.error?.error || 'Error deleting settlement'); }
      });
    }
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'bg-secondary',
      'PENDING_APPROVAL': 'bg-warning',
      'APPROVED': 'bg-info',
      'PROCESSED': 'bg-success',
      'REJECTED': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getEmployeeName(employeeId: number): string {
    const emp = this.employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }
}
