import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayFrequency } from '../../../services/payroll.service';

@Component({
  selector: 'app-pay-frequencies',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './pay-frequencies.component.html',
  styleUrls: ['./pay-frequencies.component.scss']
})
export class PayFrequenciesComponent implements OnInit {
  frequencies: PayFrequency[] = [];
  showModal = false;
  isEditing = false;
  currentFrequency: PayFrequency = this.getEmptyFrequency();

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadFrequencies();
  }

  loadFrequencies(): void {
    this.payrollService.getAllPayFrequencies().subscribe({
      next: (data) => this.frequencies = data,
      error: (err) => console.error('Error loading pay frequencies:', err)
    });
  }

  getEmptyFrequency(): PayFrequency {
    return {
      code: '',
      name: '',
      description: '',
      periodsPerYear: 12,
      payDayOfMonth: 1,
      isDefault: false,
      isActive: true
    };
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentFrequency = this.getEmptyFrequency();
    this.showModal = true;
  }

  openEditModal(freq: PayFrequency): void {
    this.isEditing = true;
    this.currentFrequency = { ...freq };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveFrequency(): void {
    if (this.isEditing && this.currentFrequency.id) {
      this.payrollService.updatePayFrequency(this.currentFrequency.id, this.currentFrequency).subscribe({
        next: () => {
          this.loadFrequencies();
          this.closeModal();
        },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.payrollService.createPayFrequency(this.currentFrequency).subscribe({
        next: () => {
          this.loadFrequencies();
          this.closeModal();
        },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  deleteFrequency(id: number): void {
    if (confirm('Delete this pay frequency?')) {
      this.payrollService.deletePayFrequency(id).subscribe({
        next: () => this.loadFrequencies(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
