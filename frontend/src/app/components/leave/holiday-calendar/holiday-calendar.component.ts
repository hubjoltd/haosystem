import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, Holiday } from '../../../services/leave.service';

@Component({
  selector: 'app-holiday-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.scss']
})
export class HolidayCalendarComponent implements OnInit {
  holidays: Holiday[] = [];
  filteredHolidays: Holiday[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editMode = false;
  selectedHoliday: Holiday | null = null;
  selectedYear = new Date().getFullYear();
  years = [2024, 2025, 2026];

  formData: Holiday = this.getEmptyFormData();

  holidayTypes = [
    { value: 'FEDERAL', label: 'Federal Holiday' },
    { value: 'COMPANY', label: 'Company Holiday' },
    { value: 'OPTIONAL', label: 'Optional Holiday' },
    { value: 'RESTRICTED', label: 'Restricted Holiday' }
  ];

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadHolidays();
  }

  getEmptyFormData(): Holiday {
    return {
      name: '',
      holidayDate: '',
      description: '',
      holidayType: 'COMPANY',
      isPaid: true,
      isOptional: false,
      isActive: true,
      applicableLocations: '',
      applicableDepartments: ''
    };
  }

  loadHolidays(): void {
    this.loading = false;
    this.leaveService.getHolidaysByYear(this.selectedYear).subscribe({
      next: (data) => {
        this.holidays = data;
        this.filteredHolidays = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterByType(type: string): void {
    if (type === 'ALL') {
      this.filteredHolidays = this.holidays;
    } else {
      this.filteredHolidays = this.holidays.filter(h => h.holidayType === type);
    }
  }

  openCreateModal(): void {
    this.editMode = false;
    this.formData = this.getEmptyFormData();
    this.showModal = true;
  }

  openEditModal(holiday: Holiday): void {
    this.editMode = true;
    this.selectedHoliday = holiday;
    this.formData = { ...holiday };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedHoliday = null;
  }

  saveHoliday(): void {
    if (this.saving) return;
    this.saving = true;
    
    if (this.editMode && this.selectedHoliday?.id) {
      this.leaveService.updateHoliday(this.selectedHoliday.id, this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.loadHolidays();
          this.closeModal();
        },
        error: () => { this.saving = false; }
      });
    } else {
      this.leaveService.createHoliday(this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.loadHolidays();
          this.closeModal();
        },
        error: () => { this.saving = false; }
      });
    }
  }

  deleteHoliday(id: number): void {
    if (confirm('Are you sure you want to delete this holiday?')) {
      this.leaveService.deleteHoliday(id).subscribe({
        next: () => this.loadHolidays()
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'FEDERAL': return '#dc3545';
      case 'COMPANY': return '#008080';
      case 'OPTIONAL': return '#ffc107';
      case 'RESTRICTED': return '#6c757d';
      default: return '#008080';
    }
  }
}
