import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRecord, PayrollRun } from '../../../../services/payroll.service';
import { ReportExportService } from '../../../../services/report-export.service';

interface OvertimeEmployeeRow {
  employeeName: string;
  employeeCode: string;
  department: string;
  regularHours: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  basePay: number;
  totalPay: number;
}

interface OvertimeDepartmentRow {
  department: string;
  employeeCount: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalOvertimePay: number;
  totalPay: number;
  overtimePercentage: number;
}

@Component({
  selector: 'app-overtime-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './overtime-report.component.html',
  styleUrls: ['./overtime-report.component.scss']
})
export class OvertimeReportComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  payrollRecords: PayrollRecord[] = [];
  employeeData: OvertimeEmployeeRow[] = [];
  departmentData: OvertimeDepartmentRow[] = [];

  selectedRunId: number | null = null;
  groupBy: 'employee' | 'department' = 'employee';

  loading = false;
  isFirstLoad = true;
  dataReady = false;

  summaryCards = {
    totalOTHours: 0,
    totalOTPay: 0,
    avgOTHoursPerEmployee: 0,
    otPercentOfTotalPay: 0
  };

  grandTotalsEmployee = {
    regularHours: 0,
    overtimeHours: 0,
    overtimePay: 0,
    basePay: 0,
    totalPay: 0
  };

  grandTotalsDepartment = {
    employeeCount: 0,
    totalRegularHours: 0,
    totalOvertimeHours: 0,
    totalOvertimePay: 0,
    totalPay: 0,
    overtimePercentage: 0
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
        } else {
          this.completeLoading();
        }
      },
      error: (err) => {
        console.error('Error loading payroll runs:', err);
        this.completeLoading();
      }
    });
  }

  loadPayrollRecords(): void {
    if (!this.selectedRunId) return;

    this.payrollService.getPayrollRecordsByRun(this.selectedRunId).subscribe({
      next: (data) => {
        this.payrollRecords = data;
        this.generateReport();
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error loading payroll records:', err);
        this.completeLoading();
      }
    });
  }

  generateReport(): void {
    this.generateEmployeeData();
    this.generateDepartmentData();
    this.calculateSummaryCards();
  }

  generateEmployeeData(): void {
    this.employeeData = this.payrollRecords.map(record => {
      const basePay = record.basePay || 0;
      const overtimePay = record.overtimePay || 0;
      const regularHours = record.regularHours || 0;
      const overtimeHours = record.overtimeHours || 0;
      const overtimeRate = overtimeHours > 0 ? overtimePay / overtimeHours : 0;

      return {
        employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'Unknown',
        employeeCode: record.employee?.employeeCode || record.employee?.id?.toString() || '-',
        department: record.employee?.department?.name || 'Unassigned',
        regularHours,
        overtimeHours,
        overtimeRate,
        overtimePay,
        basePay,
        totalPay: (record.grossPay || 0)
      };
    }).sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    this.grandTotalsEmployee = {
      regularHours: this.employeeData.reduce((sum, r) => sum + r.regularHours, 0),
      overtimeHours: this.employeeData.reduce((sum, r) => sum + r.overtimeHours, 0),
      overtimePay: this.employeeData.reduce((sum, r) => sum + r.overtimePay, 0),
      basePay: this.employeeData.reduce((sum, r) => sum + r.basePay, 0),
      totalPay: this.employeeData.reduce((sum, r) => sum + r.totalPay, 0)
    };
  }

  generateDepartmentData(): void {
    const grouped = new Map<string, OvertimeDepartmentRow>();

    this.payrollRecords.forEach(record => {
      const dept = record.employee?.department?.name || 'Unassigned';

      if (!grouped.has(dept)) {
        grouped.set(dept, {
          department: dept,
          employeeCount: 0,
          totalRegularHours: 0,
          totalOvertimeHours: 0,
          totalOvertimePay: 0,
          totalPay: 0,
          overtimePercentage: 0
        });
      }

      const row = grouped.get(dept)!;
      row.employeeCount++;
      row.totalRegularHours += record.regularHours || 0;
      row.totalOvertimeHours += record.overtimeHours || 0;
      row.totalOvertimePay += record.overtimePay || 0;
      row.totalPay += record.grossPay || 0;
    });

    grouped.forEach(row => {
      row.overtimePercentage = row.totalPay > 0 ? (row.totalOvertimePay / row.totalPay) * 100 : 0;
    });

    this.departmentData = Array.from(grouped.values()).sort((a, b) => a.department.localeCompare(b.department));

    this.grandTotalsDepartment = {
      employeeCount: this.departmentData.reduce((sum, r) => sum + r.employeeCount, 0),
      totalRegularHours: this.departmentData.reduce((sum, r) => sum + r.totalRegularHours, 0),
      totalOvertimeHours: this.departmentData.reduce((sum, r) => sum + r.totalOvertimeHours, 0),
      totalOvertimePay: this.departmentData.reduce((sum, r) => sum + r.totalOvertimePay, 0),
      totalPay: this.departmentData.reduce((sum, r) => sum + r.totalPay, 0),
      overtimePercentage: 0
    };
    this.grandTotalsDepartment.overtimePercentage = this.grandTotalsDepartment.totalPay > 0
      ? (this.grandTotalsDepartment.totalOvertimePay / this.grandTotalsDepartment.totalPay) * 100
      : 0;
  }

  calculateSummaryCards(): void {
    const totalOTHours = this.employeeData.reduce((sum, r) => sum + r.overtimeHours, 0);
    const totalOTPay = this.employeeData.reduce((sum, r) => sum + r.overtimePay, 0);
    const totalPay = this.employeeData.reduce((sum, r) => sum + r.totalPay, 0);
    const employeeCount = this.employeeData.length;

    this.summaryCards = {
      totalOTHours,
      totalOTPay,
      avgOTHoursPerEmployee: employeeCount > 0 ? totalOTHours / employeeCount : 0,
      otPercentOfTotalPay: totalPay > 0 ? (totalOTPay / totalPay) * 100 : 0
    };
  }

  onRunChange(): void {
    this.loadPayrollRecords();
  }

  onGroupByChange(): void {
    this.generateReport();
  }

  hasData(): boolean {
    return this.groupBy === 'employee' ? this.employeeData.length > 0 : this.departmentData.length > 0;
  }

  getSelectedRunInfo(): string {
    const run = this.payrollRuns.find(r => r.id === this.selectedRunId);
    if (!run) return '';
    return `${run.payrollRunNumber} (${this.formatDate(run.periodStartDate)} - ${this.formatDate(run.periodEndDate)})`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  formatNumber(value: number, decimals: number = 2): string {
    return (value || 0).toFixed(decimals);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  exportToPDF(): void {
    if (this.groupBy === 'employee') {
      const headers = ['Employee', 'Code', 'Department', 'Regular Hrs', 'OT Hours', 'OT Rate', 'OT Pay', 'Base Pay', 'Total Pay'];
      const data = this.employeeData.map(row => [
        row.employeeName,
        row.employeeCode,
        row.department,
        this.formatNumber(row.regularHours),
        this.formatNumber(row.overtimeHours),
        this.formatCurrency(row.overtimeRate),
        this.formatCurrency(row.overtimePay),
        this.formatCurrency(row.basePay),
        this.formatCurrency(row.totalPay)
      ]);
      this.exportService.exportToPDF('Overtime Report - By Employee', headers, data, 'overtime_employee');
    } else {
      const headers = ['Department', 'Employees', 'Regular Hrs', 'OT Hours', 'OT Pay', 'OT % of Total'];
      const data = this.departmentData.map(row => [
        row.department,
        row.employeeCount.toString(),
        this.formatNumber(row.totalRegularHours),
        this.formatNumber(row.totalOvertimeHours),
        this.formatCurrency(row.totalOvertimePay),
        this.formatNumber(row.overtimePercentage) + '%'
      ]);
      this.exportService.exportToPDF('Overtime Report - By Department', headers, data, 'overtime_department');
    }
  }

  exportToExcel(): void {
    if (this.groupBy === 'employee') {
      const data = this.employeeData.map(row => ({
        'Employee Name': row.employeeName,
        'Employee Code': row.employeeCode,
        'Department': row.department,
        'Regular Hours': row.regularHours,
        'OT Hours': row.overtimeHours,
        'OT Rate': row.overtimeRate,
        'OT Pay': row.overtimePay,
        'Base Pay': row.basePay,
        'Total Pay': row.totalPay
      }));
      this.exportService.exportToExcel(data, 'overtime_employee');
    } else {
      const data = this.departmentData.map(row => ({
        'Department': row.department,
        'Employee Count': row.employeeCount,
        'Total Regular Hours': row.totalRegularHours,
        'Total OT Hours': row.totalOvertimeHours,
        'Total OT Pay': row.totalOvertimePay,
        'OT % of Total': row.overtimePercentage
      }));
      this.exportService.exportToExcel(data, 'overtime_department');
    }
  }

  exportToCSV(): void {
    if (this.groupBy === 'employee') {
      const headers = ['Employee Name', 'Employee Code', 'Department', 'Regular Hours', 'OT Hours', 'OT Rate', 'OT Pay', 'Base Pay', 'Total Pay'];
      const data = this.employeeData.map(row => [
        row.employeeName,
        row.employeeCode,
        row.department,
        row.regularHours,
        row.overtimeHours,
        row.overtimeRate,
        row.overtimePay,
        row.basePay,
        row.totalPay
      ]);
      this.exportService.exportToCSV(headers, data, 'overtime_employee');
    } else {
      const headers = ['Department', 'Employee Count', 'Total Regular Hours', 'Total OT Hours', 'Total OT Pay', 'OT % of Total'];
      const data = this.departmentData.map(row => [
        row.department,
        row.employeeCount,
        row.totalRegularHours,
        row.totalOvertimeHours,
        row.totalOvertimePay,
        row.overtimePercentage
      ]);
      this.exportService.exportToCSV(headers, data, 'overtime_department');
    }
  }

  completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
    this.isFirstLoad = false;
  }
}
