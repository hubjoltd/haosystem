import { Component, OnInit } from '@angular/core';

interface Staff {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  lastLogin: string;
  active: boolean;
  isAdmin: boolean;
  isStaffMember: boolean;
  phone?: string;
  hourlyRate?: number;
  profileImage?: string;
}

@Component({
  selector: 'app-staff-management',
  standalone: false,
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.scss']
})
export class StaffManagementComponent implements OnInit {
  staff: Staff[] = [
    { id: 1, firstName: 'ABDUL', lastName: 'AZEEZ', email: 'azeez032001@gmail.com', role: 'Ganesh', lastLogin: 'Never', active: true, isAdmin: false, isStaffMember: true },
    { id: 2, firstName: 'bhuvana', lastName: 'bharathi', email: 'bhuvanabharathi1999@gmail.com', role: 'Ganesh', lastLogin: 'Never', active: true, isAdmin: false, isStaffMember: true },
    { id: 3, firstName: 'bhuvana', lastName: 'bharahi', email: 'bhuvanabharathi199bhu@gmail.com', role: '', lastLogin: 'Never', active: true, isAdmin: false, isStaffMember: true },
    { id: 4, firstName: 'Bhuvana', lastName: 'Bharathi', email: 'bhuvanabharathi19@gmail.com', role: '', lastLogin: 'Never', active: true, isAdmin: false, isStaffMember: true },
    { id: 5, firstName: 'Ganesh', lastName: 'Inventory', email: 'sigma.blgr@gmail.com', role: 'Ganesh', lastLogin: '2 days ago', active: true, isAdmin: false, isStaffMember: true },
    { id: 6, firstName: 'manoj', lastName: 'kumar', email: '2703abdul@gmail.com', role: '', lastLogin: 'Never', active: true, isAdmin: false, isStaffMember: true },
    { id: 7, firstName: 'Revathi', lastName: 'Admin', email: 'superadmin@essentiatechs.com', role: '', lastLogin: '5 hrs ago', active: true, isAdmin: true, isStaffMember: true }
  ];

  roles: string[] = ['Admin', 'Manager', 'Staff', 'Viewer', 'Ganesh'];
  
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedStaff: Staff = this.getEmptyStaff();
  activeTab: string = 'profile';
  
  pageSize: number = 25;
  currentPage: number = 1;

  ngOnInit(): void {}

  getEmptyStaff(): Staff {
    return {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      lastLogin: 'Never',
      active: true,
      isAdmin: false,
      isStaffMember: true,
      phone: '',
      hourlyRate: 0
    };
  }

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

  openModal(member?: Staff) {
    if (member) {
      this.editMode = true;
      this.selectedStaff = { ...member };
    } else {
      this.editMode = false;
      this.selectedStaff = this.getEmptyStaff();
    }
    this.activeTab = 'profile';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedStaff = this.getEmptyStaff();
  }

  saveStaff() {
    if (!this.selectedStaff.firstName.trim() || !this.selectedStaff.lastName.trim()) {
      alert('First name and last name are required');
      return;
    }

    if (!this.selectedStaff.email.trim()) {
      alert('Email is required');
      return;
    }

    if (this.editMode && this.selectedStaff.id) {
      const index = this.staff.findIndex(s => s.id === this.selectedStaff.id);
      if (index >= 0) {
        this.staff[index] = { ...this.selectedStaff };
      }
    } else {
      const newId = Math.max(...this.staff.map(s => s.id || 0), 0) + 1;
      this.staff.push({ ...this.selectedStaff, id: newId });
    }
    this.closeModal();
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

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
