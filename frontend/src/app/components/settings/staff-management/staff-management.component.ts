import { Component } from '@angular/core';

@Component({
  selector: 'app-staff-management',
  standalone: false,
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.scss']
})
export class StaffManagementComponent {
  staff = [
    { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Admin', department: 'IT', status: 'Active', joinDate: '2023-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Manager', department: 'Sales', status: 'Active', joinDate: '2023-02-20' },
    { id: 3, name: 'Mike Wilson', email: 'mike@company.com', role: 'Staff', department: 'Operations', status: 'Active', joinDate: '2023-03-10' },
    { id: 4, name: 'Emily Brown', email: 'emily@company.com', role: 'Staff', department: 'Finance', status: 'Inactive', joinDate: '2023-04-05' },
    { id: 5, name: 'David Lee', email: 'david@company.com', role: 'Viewer', department: 'HR', status: 'Active', joinDate: '2023-05-12' }
  ];

  searchQuery: string = '';
  showModal: boolean = false;

  get filteredStaff() {
    if (!this.searchQuery) return this.staff;
    return this.staff.filter(s => 
      s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'badge-success' : 'badge-danger';
  }
}
