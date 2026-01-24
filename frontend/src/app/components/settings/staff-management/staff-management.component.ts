import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService, Staff } from '../../../services/staff.service';
import { BranchService, Branch } from '../../../services/branch.service';

@Component({
  selector: 'app-staff-management',
  standalone: false,
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.scss']
})
export class StaffManagementComponent implements OnInit {
  staff: Staff[] = [];
  branches: Branch[] = [];
  loading: boolean = false;

  searchQuery: string = '';
  selectedBranchId: number | null = null;
  pageSize: number = 25;
  currentPage: number = 1;

  constructor(
    private router: Router, 
    private staffService: StaffService,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadStaff();
  }

  loadBranches(): void {
    this.branchService.getAllBranches().subscribe({
      next: (data: Branch[]) => {
        this.branches = data;
      },
      error: () => {}
    });
  }

  onBranchFilterChange(): void {
    this.currentPage = 1;
  }

  loadStaff(): void {
    this.loading = true;
    this.staffService.getAll().subscribe({
      next: (data) => {
        this.staff = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading staff:', err);
        this.loading = false;
      }
    });
  }

  get filteredStaff(): Staff[] {
    let result = this.staff;
    
    if (this.selectedBranchId) {
      result = result.filter(s => s.branchId === this.selectedBranchId);
    }
    
    if (this.searchQuery) {
      result = result.filter(s => 
        (s.firstName?.toLowerCase() || '').includes(this.searchQuery.toLowerCase()) ||
        (s.lastName?.toLowerCase() || '').includes(this.searchQuery.toLowerCase()) ||
        (s.email?.toLowerCase() || '').includes(this.searchQuery.toLowerCase()) ||
        (s.branchName?.toLowerCase() || '').includes(this.searchQuery.toLowerCase())
      );
    }
    
    return result;
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
    return `${member.firstName || ''} ${member.lastName || ''}`.trim();
  }

  addStaff(): void {
    this.router.navigate(['/app/settings/staff/add']);
  }

  toggleActive(member: Staff): void {
    this.staffService.toggleActive(member.id!).subscribe({
      next: () => {
        member.active = !member.active;
      },
      error: (err) => {
        console.error('Error toggling active status:', err);
      }
    });
  }

  exportData(): void {
    console.log('Export staff data');
  }

  refresh(): void {
    this.loadStaff();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
