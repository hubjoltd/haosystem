import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../../services/payroll.service';
import { ReportExportService } from '../../../../services/report-export.service';

interface LaborCostRow {
  costCenter: string;
  department: string;
  employeeCount: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  benefits: number;
  taxes: number;
  employerContributions: number;
  totalLaborCost: number;
}

@Component({
  selector: 'app-labor-cost-allocation-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labor-cost-allocation-report.component.html',
  styleUrls: ['./labor-cost-allocation-report.component.scss']
})
export class LaborCostAllocationReportComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  laborCostData: LaborCostRow[] = [];
  
  selectedRunId: number | null = null;
  
  loading = false;
  
  grandTotals = {
    employeeCount: 0,
    regularPay: 0,
    overtimePay: 0,
    bonuses: 0,
    benefits: 0,
    taxes: 0,
    employerContributions: 0,
    totalLaborCost: 0
  };

  constructor(
    private payrollService: PayrollService,
    private exportService: ReportExportService
  ) {}

  ngOnInit(): void {
    this.loadPayrollRuns();
  }

  loadPayrollRuns(): void {
    this.payrollService.getPayrollRuns().subscribe({
      next: (data) => {
        this.payrollRuns = data.filter(run => run.status === 'PROCESSED' || run.status === 'APPROVED');
        if (this.payrollRuns.length > 0) {
          this.selectedRunId = this.payrollRuns[0].id!;
          this.loadPayrollRecords();
        }
      },
      error: (err) => console.error('Error loading payroll runs:', err)
    });
  }

  loadPayrollRecords(): void {
    if (!this.selectedRunId) return;
    
    this.loading = true;
    this.payrollService.getPayrollRecordsByRun(this.selectedRunId).subscribe({
      next: (data) => {
        this.payrollRecords = data;
        this.generateLaborCostReport();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payroll records:', err);
        this.loading = false;
      }
    });
  }

  generateLaborCostReport(): void {
    const grouped = new Map<string, LaborCostRow>();
    
    this.payrollRecords.forEach(record => {
      const costCenter = record.costCenterCode || record.employee?.costCenter?.code || 'UNASSIGNED';
      const department = record.employee?.department?.name || 'Unassigned';
      const key = `${costCenter}-${department}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          costCenter: costCenter,
          department: department,
          employeeCount: 0,
          regularPay: 0,
          overtimePay: 0,
          bonuses: 0,
          benefits: 0,
          taxes: 0,
          employerContributions: 0,
          totalLaborCost: 0
        });
      }
      
      const row = grouped.get(key)!;
      row.employeeCount++;
      row.regularPay += record.basePay || 0;
      row.overtimePay += record.overtimePay || 0;
      row.bonuses += record.bonuses || 0;
      row.benefits += (record.employerHealthContribution || 0);
      row.taxes += (record.employerSocialSecurity || 0) + (record.employerMedicare || 0);
      row.employerContributions += record.totalEmployerContributions || 0;
      row.totalLaborCost = row.regularPay + row.overtimePay + row.bonuses + row.employerContributions;
    });
    
    this.laborCostData = Array.from(grouped.values()).sort((a, b) => a.costCenter.localeCompare(b.costCenter));
    this.calculateGrandTotals();
  }

  calculateGrandTotals(): void {
    this.grandTotals = {
      employeeCount: this.laborCostData.reduce((sum, row) => sum + row.employeeCount, 0),
      regularPay: this.laborCostData.reduce((sum, row) => sum + row.regularPay, 0),
      overtimePay: this.laborCostData.reduce((sum, row) => sum + row.overtimePay, 0),
      bonuses: this.laborCostData.reduce((sum, row) => sum + row.bonuses, 0),
      benefits: this.laborCostData.reduce((sum, row) => sum + row.benefits, 0),
      taxes: this.laborCostData.reduce((sum, row) => sum + row.taxes, 0),
      employerContributions: this.laborCostData.reduce((sum, row) => sum + row.employerContributions, 0),
      totalLaborCost: this.laborCostData.reduce((sum, row) => sum + row.totalLaborCost, 0)
    };
  }

  onRunChange(): void {
    this.loadPayrollRecords();
  }

  getCostPercentage(amount: number): string {
    if (this.grandTotals.totalLaborCost === 0) return '0%';
    return ((amount / this.grandTotals.totalLaborCost) * 100).toFixed(1) + '%';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  exportToPDF(): void {
    const headers = ['Cost Center', 'Department', 'Employees', 'Regular Pay', 'Overtime', 'Bonuses', 'Employer Cost', 'Total Cost'];
    const data = this.laborCostData.map(row => [
      row.costCenter,
      row.department,
      row.employeeCount.toString(),
      this.formatCurrency(row.regularPay),
      this.formatCurrency(row.overtimePay),
      this.formatCurrency(row.bonuses),
      this.formatCurrency(row.employerContributions),
      this.formatCurrency(row.totalLaborCost)
    ]);
    
    this.exportService.exportToPDF('Labor Cost Allocation Report', headers, data, 'labor_cost_allocation');
  }

  exportToExcel(): void {
    const data = this.laborCostData.map(row => ({
      'Cost Center': row.costCenter,
      'Department': row.department,
      'Employee Count': row.employeeCount,
      'Regular Pay': row.regularPay,
      'Overtime Pay': row.overtimePay,
      'Bonuses': row.bonuses,
      'Benefits': row.benefits,
      'Taxes': row.taxes,
      'Employer Contributions': row.employerContributions,
      'Total Labor Cost': row.totalLaborCost
    }));
    
    this.exportService.exportToExcel(data, 'labor_cost_allocation');
  }

  exportToCSV(): void {
    const headers = ['Cost Center', 'Department', 'Employee Count', 'Regular Pay', 'Overtime Pay', 'Bonuses', 'Benefits', 'Taxes', 'Employer Contributions', 'Total Labor Cost'];
    const data = this.laborCostData.map(row => [
      row.costCenter,
      row.department,
      row.employeeCount,
      row.regularPay,
      row.overtimePay,
      row.bonuses,
      row.benefits,
      row.taxes,
      row.employerContributions,
      row.totalLaborCost
    ]);
    
    this.exportService.exportToCSV(headers, data, 'labor_cost_allocation');
  }
}
