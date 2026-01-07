import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveType } from '../../../services/leave.service';

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-types.component.html',
  styleUrls: ['./leave-types.component.scss']
})
export class LeaveTypesComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  filteredLeaveTypes: LeaveType[] = [];
  searchTerm = '';
  loading = false;
  saving = false;
  showModal = false;
  editMode = false;
  selectedLeaveType: LeaveType | null = null;

  formData: LeaveType = this.getEmptyFormData();

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadLeaveTypes();
  }

  getEmptyFormData(): LeaveType {
    return {
      code: '',
      name: '',
      description: '',
      annualEntitlement: 0,
      accrualType: 'ANNUALLY',
      accrualRate: 0,
      carryForwardAllowed: false,
      maxCarryForward: 0,
      encashmentAllowed: false,
      encashmentRate: 0,
      requiresApproval: true,
      minNoticeDays: 0,
      maxConsecutiveDays: 0,
      isPaid: true,
      isActive: true,
      documentRequired: false,
      applicableGender: 'ALL',
      colorCode: '#008080',
      timeUnit: 'DAYS',
      allowHourlyLeave: false
    };
  }

  loadLeaveTypes(): void {
    this.loading = false;
    this.leaveService.getAllLeaveTypes().subscribe({
      next: (data) => {
        this.leaveTypes = data;
        this.filterLeaveTypes();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterLeaveTypes(): void {
    this.filteredLeaveTypes = this.leaveTypes.filter(lt =>
      lt.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      lt.code.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal(): void {
    this.editMode = false;
    this.formData = this.getEmptyFormData();
    this.showModal = true;
  }

  openEditModal(leaveType: LeaveType): void {
    this.editMode = true;
    this.selectedLeaveType = leaveType;
    this.formData = { ...leaveType };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedLeaveType = null;
  }

  saveLeaveType(): void {
    if (this.saving) return;
    this.saving = true;
    
    if (this.editMode && this.selectedLeaveType?.id) {
      this.leaveService.updateLeaveType(this.selectedLeaveType.id, this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.loadLeaveTypes();
          this.closeModal();
        },
        error: () => { this.saving = false; }
      });
    } else {
      this.leaveService.createLeaveType(this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.loadLeaveTypes();
          this.closeModal();
        },
        error: () => { this.saving = false; }
      });
    }
  }

  deleteLeaveType(id: number): void {
    if (confirm('Are you sure you want to delete this leave type?')) {
      this.leaveService.deleteLeaveType(id).subscribe({
        next: () => this.loadLeaveTypes()
      });
    }
  }
}
