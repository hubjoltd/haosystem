import { Component, OnInit, ChangeDetectorRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService, Employee } from '../../../../services/employee.service';
import { OrganizationService, Department, Designation } from '../../../../services/organization.service';
import { ToastService } from '../../../../services/toast.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments: Department[] = [];
  designations: Designation[] = [];
  
  searchQuery = '';
  filterDepartment = '';
  filterStatus = '';
  showExportMenu = false;
  
  loading = false;
  dataReady = false;
  private subscriptionCount = 0;
  private expectedSubscriptions = 3;

  constructor(
    private employeeService: EmployeeService,
    private orgService: OrganizationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-dropdown')) {
      this.showExportMenu = false;
    }
  }

  loadData() {
    this.loading = true;
    this.dataReady = false;
    this.subscriptionCount = 0;
    
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        this.applyFilters();
        this.incrementSubscriptionCount();
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.incrementSubscriptionCount();
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
    
    this.orgService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.incrementSubscriptionCount();
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.incrementSubscriptionCount();
      }
    });
    
    this.orgService.getDesignations().subscribe({
      next: (data) => {
        this.designations = data;
        this.incrementSubscriptionCount();
      },
      error: (err) => {
        console.error('Error loading designations:', err);
        this.incrementSubscriptionCount();
      }
    });
  }

  private incrementSubscriptionCount() {
    this.subscriptionCount++;
    if (this.subscriptionCount >= this.expectedSubscriptions) {
      this.completeLoading();
    }
  }

  private completeLoading() {
    this.loading = false;
    this.dataReady = true;
    this.cdr.detectChanges();
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = !this.searchQuery || 
        emp.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesDepartment = !this.filterDepartment || 
        (emp.department && emp.department.id?.toString() === this.filterDepartment);
      
      const matchesStatus = !this.filterStatus || 
        (this.filterStatus === 'active' && emp.active) ||
        (this.filterStatus === 'inactive' && !emp.active);
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }

  onSearch() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterDepartment = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  addEmployee() {
    this.router.navigate(['/app/hr/employees/new']);
  }

  viewEmployee(id: number) {
    this.router.navigate(['/app/hr/employees', id]);
  }

  editEmployee(id: number) {
    this.router.navigate(['/app/hr/employees', id], { queryParams: { edit: true } });
  }

  deleteEmployee(emp: Employee) {
    if (emp.id && confirm(`Are you sure you want to delete ${emp.firstName} ${emp.lastName}?`)) {
      this.loading = true;
      this.cdr.markForCheck();
      this.employeeService.delete(emp.id).subscribe({
        next: () => {
          this.employees = this.employees.filter(e => e.id !== emp.id);
          this.applyFilters();
          this.loading = false;
          this.toastService.success('Employee deleted successfully');
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error deleting employee:', err);
          this.loading = false;
          this.toastService.error('Failed to delete employee');
          this.cdr.markForCheck();
        }
      });
    }
  }

  getStatusClass(emp: Employee): string {
    if (!emp.active) return 'status-inactive';
    switch (emp.employmentStatus) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'PROBATION': return 'status-probation';
      case 'NOTICE': return 'status-notice';
      case 'RESIGNED': return 'status-resigned';
      default: return 'status-active';
    }
  }

  get activeCount(): number {
    return this.employees.filter(emp => emp.active).length;
  }

  get inactiveCount(): number {
    return this.employees.filter(emp => !emp.active).length;
  }

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  private getExportData(): any[] {
    return this.filteredEmployees.map(emp => ({
      'Employee Code': emp.employeeCode || '',
      'First Name': emp.firstName || '',
      'Last Name': emp.lastName || '',
      'Email': emp.email || '',
      'Phone': emp.phone || '',
      'Gender': emp.gender || '',
      'Date of Birth': emp.dateOfBirth || '',
      'Nationality': emp.nationality || '',
      'Marital Status': emp.maritalStatus || '',
      'Department': emp.department?.name || '',
      'Designation': emp.designation?.title || '',
      'Location': emp.location?.name || '',
      'Grade': emp.grade?.name || '',
      'Job Role': emp.jobRole?.title || '',
      'Cost Center': emp.costCenter?.name || '',
      'Expense Center': emp.expenseCenter?.name || '',
      'Joining Date': emp.joiningDate || '',
      'Confirmation Date': emp.confirmationDate || '',
      'Resignation Date': emp.resignationDate || '',
      'Last Working Date': emp.lastWorkingDate || '',
      'Employment Type': emp.employmentType || '',
      'Employment Status': emp.employmentStatus || '',
      'Reporting Manager': emp.reportingManager ? `${emp.reportingManager.firstName} ${emp.reportingManager.lastName}` : '',
      'Status': emp.active ? 'Active' : 'Inactive',
      'Permanent Address': this.formatAddress(emp.permanentAddress),
      'Current Address': this.formatAddress(emp.currentAddress),
      'Emergency Contact Name': emp.emergencyContactName || '',
      'Emergency Contact Phone': emp.emergencyContactPhone || '',
      'Emergency Contact Relationship': emp.emergencyContactRelation || ''
    }));
  }

  private formatAddress(address: any): string {
    if (!address) return '';
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  }

  exportToExcel(): void {
    this.showExportMenu = false;
    const data = this.getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    
    const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, `employees_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportToCSV(): void {
    this.showExportMenu = false;
    const data = this.getExportData();
    if (data.length === 0) {
      this.toastService.warning('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header] || '';
          return `"${String(cell).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPDF(): void {
    this.showExportMenu = false;
    const doc = new jsPDF('landscape', 'mm', 'a3');
    const exportData = this.getExportData();
    
    doc.setFontSize(18);
    doc.setTextColor(0, 128, 128);
    doc.text('Employee Master List - Complete Details', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Total Records: ${this.filteredEmployees.length}`, 14, 27);
    
    const headers = Object.keys(exportData[0] || {});
    const data = exportData.map(row => headers.map(h => String(row[h] || '')));
    
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 32,
      styles: { fontSize: 6, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: [0, 128, 128], textColor: 255, fontStyle: 'bold', fontSize: 6 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 10, right: 10 },
      columnStyles: headers.reduce((acc: any, _, i) => {
        acc[i] = { cellWidth: 'auto' };
        return acc;
      }, {}),
      tableWidth: 'auto'
    });
    
    doc.save(`employees_complete_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  printEmployees(): void {
    this.showExportMenu = false;
    const data = this.getExportData();
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.toastService.warning('Please allow popups for this website');
      return;
    }
    
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Employee Master List - Complete Details</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 10px; }
          h1 { color: #008080; margin-bottom: 5px; font-size: 18px; }
          .meta { color: #666; margin-bottom: 15px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; font-size: 7px; }
          th, td { border: 1px solid #ddd; padding: 3px 4px; text-align: left; word-wrap: break-word; max-width: 80px; }
          th { background: #008080; color: white; font-weight: bold; font-size: 7px; }
          tr:nth-child(even) { background: #f9f9f9; }
          @media print {
            body { margin: 5mm; }
            button { display: none; }
            @page { size: A3 landscape; margin: 5mm; }
          }
        </style>
      </head>
      <body>
        <h1>Employee Master List - Complete Details</h1>
        <div class="meta">
          <p>Generated on: ${new Date().toLocaleDateString()} | Total Records: ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }

  exportEmployees(): void {
    this.exportToCSV();
  }
}
