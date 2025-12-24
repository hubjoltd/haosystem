import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HRLetterService, HRLetter } from '../../../services/hr-letter.service';
import { EmployeeService } from '../../../services/employee.service';

@Component({
  selector: 'app-letters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './letters.component.html',
  styleUrl: './letters.component.scss'
})
export class LettersComponent implements OnInit {
  letters: HRLetter[] = [];
  employees: any[] = [];
  loading = false;
  showForm = false;
  showPreview = false;
  selectedLetter: HRLetter | null = null;
  filterType = '';
  filterStatus = '';

  letterTypes = [
    { value: 'OFFER', label: 'Offer Letter' },
    { value: 'APPOINTMENT', label: 'Appointment Letter' },
    { value: 'EXPERIENCE', label: 'Experience Certificate' },
    { value: 'WARNING', label: 'Warning Letter' },
    { value: 'SALARY_REVISION', label: 'Salary Revision Letter' }
  ];

  formData: any = {
    letterType: 'OFFER',
    employeeId: null,
    reason: '',
    warningLevel: 'First',
    lastWorkingDate: '',
    newSalary: '',
    increment: '',
    effectiveDate: ''
  };

  constructor(
    private letterService: HRLetterService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadLetters();
    this.loadEmployees();
  }

  loadLetters(): void {
    this.loading = false;
    this.letterService.getAllLetters().subscribe({
      next: (data) => { this.letters = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data: any[]) => this.employees = data,
      error: (err: any) => console.error(err)
    });
  }

  get filteredLetters(): HRLetter[] {
    return this.letters.filter(l => {
      if (this.filterType && l.letterType !== this.filterType) return false;
      if (this.filterStatus && l.status !== this.filterStatus) return false;
      return true;
    });
  }

  openForm(): void {
    this.formData = {
      letterType: 'OFFER',
      employeeId: null,
      reason: '',
      warningLevel: 'First',
      lastWorkingDate: new Date().toISOString().split('T')[0],
      newSalary: '',
      increment: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  generateLetter(): void {
    if (!this.formData.employeeId) {
      alert('Please select an employee');
      return;
    }

    const employeeId = this.formData.employeeId;
    let request;

    switch (this.formData.letterType) {
      case 'OFFER':
        request = this.letterService.generateOfferLetter(employeeId, {});
        break;
      case 'APPOINTMENT':
        request = this.letterService.generateAppointmentLetter(employeeId);
        break;
      case 'EXPERIENCE':
        if (!this.formData.lastWorkingDate) {
          alert('Please enter the last working date');
          return;
        }
        request = this.letterService.generateExperienceLetter(employeeId, this.formData.lastWorkingDate);
        break;
      case 'WARNING':
        if (!this.formData.reason || this.formData.reason.trim() === '') {
          alert('Please enter the reason for the warning');
          return;
        }
        request = this.letterService.generateWarningLetter(employeeId, this.formData.reason, this.formData.warningLevel);
        break;
      case 'SALARY_REVISION':
        if (!this.formData.effectiveDate) {
          alert('Please enter the effective date');
          return;
        }
        const newSalary = this.formData.newSalary ? parseFloat(this.formData.newSalary) : null;
        const increment = this.formData.increment ? parseFloat(this.formData.increment) : null;
        if (this.formData.newSalary && isNaN(newSalary as number)) {
          alert('Please enter a valid salary amount');
          return;
        }
        if (this.formData.increment && isNaN(increment as number)) {
          alert('Please enter a valid increment percentage');
          return;
        }
        request = this.letterService.generateSalaryRevisionLetter(employeeId, {
          newSalary: newSalary,
          increment: increment,
          effectiveDate: this.formData.effectiveDate
        });
        break;
      default:
        return;
    }

    request.subscribe({
      next: () => {
        alert('Letter generated successfully!');
        this.closeForm();
        this.loadLetters();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error generating letter: ' + (err.error?.message || 'Please try again'));
      }
    });
  }

  viewLetter(letter: HRLetter): void {
    this.selectedLetter = letter;
    this.showPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
    this.selectedLetter = null;
  }

  signLetter(letter: HRLetter): void {
    const signedBy = prompt('Enter your name:');
    const designation = prompt('Enter your designation:');
    if (signedBy && designation) {
      this.letterService.signLetter(letter.id, signedBy, designation).subscribe({
        next: () => this.loadLetters(),
        error: (err) => console.error(err)
      });
    }
  }

  issueLetter(letter: HRLetter): void {
    if (confirm('Issue this letter to the employee?')) {
      this.letterService.issueLetter(letter.id).subscribe({
        next: () => this.loadLetters(),
        error: (err) => console.error(err)
      });
    }
  }

  deleteLetter(letter: HRLetter): void {
    if (confirm('Are you sure you want to delete this letter?')) {
      this.letterService.deleteLetter(letter.id).subscribe({
        next: () => this.loadLetters(),
        error: (err) => console.error(err)
      });
    }
  }

  getLetterTypeLabel(type: string): string {
    const found = this.letterTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'bg-secondary',
      'GENERATED': 'bg-info',
      'SIGNED': 'bg-primary',
      'ISSUED': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  getEmployeeName(employee: any): string {
    if (!employee) return '';
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  }
}
