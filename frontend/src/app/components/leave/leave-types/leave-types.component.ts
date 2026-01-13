import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LeaveService, LeaveType } from '../../../services/leave.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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

  constructor(
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.loading = true;
    this.cdr.markForCheck();
    this.leaveService.getAllLeaveTypes().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data) => {
        this.leaveTypes = data;
        this.filterLeaveTypes();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading leave types:', err);
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
    this.cdr.markForCheck();
    
    const request$ = this.editMode && this.selectedLeaveType?.id
      ? this.leaveService.updateLeaveType(this.selectedLeaveType.id, this.formData)
      : this.leaveService.createLeaveType(this.formData);
      
    request$.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.loadLeaveTypes();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving leave type:', err);
        alert('Error saving leave type');
      }
    });
  }

  deleteLeaveType(id: number): void {
    if (confirm('Are you sure you want to delete this leave type?')) {
      this.leaveService.deleteLeaveType(id).subscribe({
        next: () => this.loadLeaveTypes()
      });
    }
  }
}
