import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService, Employee } from '../../../../services/employee.service';
import { OrganizationService, Department, Designation } from '../../../../services/organization.service';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments: Department[] = [];
  designations: Designation[] = [];
  
  searchQuery = '';
  filterDepartment = '';
  filterStatus = '';
  
  loading = false;
  dataReady = false;
  private subscriptionCount = 0;
  private expectedSubscriptions = 3;

  constructor(
    private employeeService: EmployeeService,
    private orgService: OrganizationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = false;
    this.dataReady = true;
    this.subscriptionCount = 0;
    
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading employees:', err);
      }
    });
    
    this.orgService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
    
    this.orgService.getDesignations().subscribe({
      next: (data) => {
        this.designations = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading designations:', err);
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
      this.employeeService.delete(emp.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting employee:', err)
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

  exportEmployees(): void {
    const headers = ['Employee Code', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Designation', 'Status', 'Joining Date'];
    const rows = this.filteredEmployees.map(emp => [
      emp.employeeCode,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.phone || '',
      emp.department?.name || '',
      emp.designation?.title || '',
      emp.active ? 'Active' : 'Inactive',
      emp.joiningDate || ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
