import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Staff {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  lastLogin: string;
  active: boolean;
}

@Component({
  selector: 'app-staff-management',
  standalone: false,
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.scss']
})
export class StaffManagementComponent implements OnInit {
  staff: Staff[] = [
    { id: 1, firstName: 'ABDUL', lastName: 'AZEEZ', email: 'azeez032001@gmail.com', role: 'Ganesh', lastLogin: 'Never', active: true },
    { id: 2, firstName: 'bhuvana', lastName: 'bharathi', email: 'bhuvanabharathi1999@gmail.com', role: 'Ganesh', lastLogin: 'Never', active: true },
    { id: 3, firstName: 'bhuvana', lastName: 'bharahi', email: 'bhuvanabharathi199bhu@gmail.com', role: '', lastLogin: 'Never', active: true },
    { id: 4, firstName: 'Bhuvana', lastName: 'Bharathi', email: 'bhuvanabharathi19@gmail.com', role: '', lastLogin: 'Never', active: true },
    { id: 5, firstName: 'Ganesh', lastName: 'Inventory', email: 'sigma.blgr@gmail.com', role: 'Ganesh', lastLogin: '2 days ago', active: true },
    { id: 6, firstName: 'manoj', lastName: 'kumar', email: '2703abdul@gmail.com', role: '', lastLogin: 'Never', active: true },
    { id: 7, firstName: 'Revathi', lastName: 'Admin', email: 'superadmin@essentiatechs.com', role: '', lastLogin: '5 hrs ago', active: true }
  ];

  searchQuery: string = '';
  pageSize: number = 25;
  currentPage: number = 1;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get filteredStaff(): Staff[] {
    if (!this.searchQuery) return this.staff;
    return this.staff.filter(s => 
      s.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get paginatedStaff(): Staff[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStaff.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStaff.length / this.pageSize) || 1;
  }

  get startEntry(): number {
    return this.filteredStaff.length > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get endEntry(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredStaff.length);
  }

  getFullName(member: Staff): string {
    return `${member.firstName} ${member.lastName}`.trim();
  }

  addStaff() {
    this.router.navigate(['/app/settings/staff/add']);
  }

  toggleActive(member: Staff) {
    member.active = !member.active;
  }

  exportData() {
    console.log('Export staff data');
  }

  refresh() {
    console.log('Refresh staff data');
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
