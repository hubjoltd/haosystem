import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRun, PayrollRecord } from '../../../services/payroll.service';
import { EmployeeService, Employee } from '../../../services/employee.service';
import { ToastService } from '../../../services/toast.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-payroll-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './payroll-history.component.html',
  styleUrls: ['./payroll-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollHistoryComponent implements OnInit {
  loading = false;
  payrollRuns: PayrollRun[] = [];
  employees: Employee[] = [];

  dateFrom = '';
  dateTo = '';
  selectedProject = '';
  projects: string[] = [];

  showDetailsModal = false;
  selectedRun: PayrollRun | null = null;
  selectedRunRecords: PayrollRecord[] = [];
  detailSummary = { totalEmployees: 0, grossPay: 0, totalTax: 0, netPay: 0 };

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.employeeService.getAll().subscribe({
      next: (emps) => {
        this.employees = emps;
        this.loadPayrollRuns();
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.loadPayrollRuns();
      }
    });
  }

  loadPayrollRuns(): void {
    this.payrollService.getPayrollRuns().subscribe({
      next: (runs) => {
        this.payrollRuns = runs.filter(r => {
          const status = r.status?.toUpperCase();
          return status === 'PROCESSED' ||
                 status === 'COMPLETED' ||
                 status === 'FULLY_PROCESSED';
        });
        this.extractProjects();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  extractProjects(): void {
    const projectSet = new Set<string>();
    this.payrollRuns.forEach(run => {
      if (run.description) {
        projectSet.add(run.description);
      }
    });
    this.projects = Array.from(projectSet).sort();
  }

  get filteredRuns(): PayrollRun[] {
    return this.payrollRuns.filter(run => {
      let matchesDate = true;
      if (this.dateFrom) {
        const fromDate = new Date(this.dateFrom);
        const runStart = new Date(run.periodStartDate);
        matchesDate = matchesDate && runStart >= fromDate;
      }
      if (this.dateTo) {
        const toDate = new Date(this.dateTo);
        const runEnd = new Date(run.periodEndDate);
        matchesDate = matchesDate && runEnd <= toDate;
      }
      let matchesProject = true;
      if (this.selectedProject) {
        matchesProject = run.description === this.selectedProject;
      }
      return matchesDate && matchesProject;
    });
  }

  viewRunDetails(run: PayrollRun): void {
    this.selectedRun = run;
    this.selectedRunRecords = [];
    this.showDetailsModal = true;
    this.cdr.markForCheck();

    if (run.id) {
      this.payrollService.getPayrollRecordsByRun(run.id).subscribe({
        next: (records: PayrollRecord[]) => {
          this.selectedRunRecords = records;
          this.calculateDetailSummary();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading run records:', err);
          this.toastService.error('Failed to load payroll run details');
          this.calculateDetailSummary();
          this.cdr.markForCheck();
        }
      });
    } else {
      this.calculateDetailSummary();
    }
  }

  calculateDetailSummary(): void {
    this.detailSummary = {
      totalEmployees: this.selectedRunRecords.length || this.selectedRun?.totalEmployees || 0,
      grossPay: this.selectedRunRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0) || this.selectedRun?.totalGrossPay || 0,
      totalTax: this.selectedRunRecords.reduce((sum, r) => sum + (r.totalTaxes || 0), 0) || this.selectedRun?.totalTaxes || 0,
      netPay: this.selectedRunRecords.reduce((sum, r) => sum + (r.netPay || 0), 0) || this.selectedRun?.totalNetPay || 0
    };
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRun = null;
    this.selectedRunRecords = [];
    this.cdr.markForCheck();
  }

  getRunTotalEmployees(run: PayrollRun): number {
    return run.totalEmployees || 0;
  }

  getPeriodTypeLabel(run: PayrollRun): string {
    const freq = run.payFrequency?.name?.toLowerCase() || '';
    if (freq.includes('bi-weekly') || freq.includes('biweekly')) return 'Bi-Weekly';
    if (freq.includes('semi')) return 'Semi-Monthly';
    if (freq.includes('weekly')) return 'Weekly';
    if (freq.includes('monthly')) return 'Monthly';
    return run.payFrequency?.name || 'Monthly';
  }

  getPeriodTypeBadgeClass(run: PayrollRun): string {
    const label = this.getPeriodTypeLabel(run);
    switch (label) {
      case 'Weekly': return 'badge-weekly';
      case 'Bi-Weekly': return 'badge-biweekly';
      case 'Semi-Monthly': return 'badge-semimonthly';
      case 'Monthly': return 'badge-monthly';
      default: return 'badge-weekly';
    }
  }

  clearFilters(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedProject = '';
    this.cdr.markForCheck();
  }

  getEmployeeName(record: PayrollRecord): string {
    const emp = record.employee;
    if (emp) {
      return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  }

  getEmployeeCode(record: PayrollRecord): string {
    return record.employee?.employeeCode || '-';
  }

  getEmployeeType(record: PayrollRecord): string {
    if (record.employeeType) {
      const t = record.employeeType.toUpperCase();
      if (t.includes('SUB') || t.includes('CONTRACT')) return 'Subcontractor';
      return 'Full-Time';
    }
    const empType = record.employee?.employmentType?.toUpperCase() || '';
    if (empType.includes('SUB') || empType.includes('CONTRACT')) return 'Subcontractor';
    return 'Full-Time';
  }

  getTotalHours(record: PayrollRecord): number {
    return (record.regularHours || 0) + (record.overtimeHours || 0);
  }

  getDetailRecordTotals(): { gross: number; federal: number; state: number; socSec: number; medicare: number; totalTax: number; netPay: number; hours: number } {
    const totals = { gross: 0, federal: 0, state: 0, socSec: 0, medicare: 0, totalTax: 0, netPay: 0, hours: 0 };
    this.selectedRunRecords.forEach(r => {
      totals.gross += r.grossPay || 0;
      totals.federal += r.federalTax || 0;
      totals.state += r.stateTax || 0;
      totals.socSec += r.socialSecurityTax || 0;
      totals.medicare += r.medicareTax || 0;
      totals.totalTax += r.totalTaxes || 0;
      totals.netPay += r.netPay || 0;
      totals.hours += (r.regularHours || 0) + (r.overtimeHours || 0);
    });
    return totals;
  }

  formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return '$0.00';
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid': return 'paid';
      case 'processed': return 'paid';
      case 'pending': return 'pending';
      case 'on hold': return 'on-hold';
      default: return 'default';
    }
  }

  exportToPDF(): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(16);
    doc.setTextColor(0, 102, 102);
    doc.text('Payroll History Report', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Total Runs: ${this.filteredRuns.length}`, 14, 28);

    const tableData = this.filteredRuns.map((run, i) => [
      i + 1,
      `${this.formatDate(run.periodStartDate)} to ${this.formatDate(run.periodEndDate)}`,
      this.formatDate(run.payDate),
      this.getPeriodTypeLabel(run),
      run.totalEmployees || 0,
      this.formatCurrency(run.totalGrossPay || 0),
      this.formatCurrency(run.totalTaxes || 0),
      this.formatCurrency(run.totalNetPay || 0)
    ]);

    autoTable(doc, {
      head: [['#', 'Pay Period', 'Pay Date', 'Type', 'Employees', 'Gross', 'Taxes', 'Net Payment']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [0, 102, 102], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    doc.save(`payroll_history_${new Date().toISOString().split('T')[0]}.pdf`);
    this.toastService.success('PDF exported successfully');
  }

  exportToCSV(): void {
    const headers = ['#', 'Pay Period Start', 'Pay Period End', 'Pay Date', 'Type', 'Employees', 'Gross', 'Taxes', 'Net Payment'];

    const csvContent = [
      headers.join(','),
      ...this.filteredRuns.map((run, i) => [
        i + 1,
        run.periodStartDate,
        run.periodEndDate,
        run.payDate,
        this.getPeriodTypeLabel(run),
        run.totalEmployees || 0,
        (run.totalGrossPay || 0).toFixed(2),
        (run.totalTaxes || 0).toFixed(2),
        (run.totalNetPay || 0).toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toastService.success('CSV exported successfully');
  }
}
