import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../../services/payroll.service';
import { EmployeeService } from '../../../services/employee.service';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  isActive: boolean;
}

@Component({
  selector: 'app-timesheet-generation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet-generation-dialog.component.html',
  styleUrls: ['./timesheet-generation-dialog.component.scss']
})
export class TimesheetGenerationDialogComponent implements OnInit {
  @Input() showDialog = false;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() timesheetsGenerated = new EventEmitter<any>();

  activeTab: 'attendance' | 'project' = 'attendance';
  
  employees: Employee[] = [];
  selectedEmployeeIds: number[] = [];
  selectAllEmployees = true;
  
  attendanceForm = {
    startDate: '',
    endDate: '',
    payFrequency: 'MONTHLY'
  };

  projectForm = {
    startDate: '',
    endDate: '',
    projectCode: '',
    projectName: ''
  };

  payFrequencies = [
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BI_WEEKLY', label: 'Bi-Weekly' },
    { value: 'SEMI_MONTHLY', label: 'Semi-Monthly' },
    { value: 'MONTHLY', label: 'Monthly' }
  ];

  generatedAttendanceTimesheets: any[] = [];
  generatedProjectTimesheets: any[] = [];
  
  generating = false;
  showResults = false;

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.setDefaultDates();
  }

  loadEmployees(): void {
    this.employeeService.getActive().subscribe({
      next: (employees: any[]) => {
        this.employees = employees;
      },
      error: (err: any) => console.error('Error loading employees:', err)
    });
  }

  setDefaultDates(): void {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.attendanceForm.startDate = firstOfMonth.toISOString().split('T')[0];
    this.attendanceForm.endDate = lastOfMonth.toISOString().split('T')[0];
    this.projectForm.startDate = firstOfMonth.toISOString().split('T')[0];
    this.projectForm.endDate = lastOfMonth.toISOString().split('T')[0];
  }

  switchTab(tab: 'attendance' | 'project'): void {
    this.activeTab = tab;
    this.showResults = false;
    this.generatedAttendanceTimesheets = [];
    this.generatedProjectTimesheets = [];
  }

  toggleSelectAll(): void {
    if (this.selectAllEmployees) {
      this.selectedEmployeeIds = [];
    } else {
      this.selectedEmployeeIds = this.employees.map(e => e.id);
    }
  }

  toggleEmployeeSelection(employeeId: number): void {
    const index = this.selectedEmployeeIds.indexOf(employeeId);
    if (index > -1) {
      this.selectedEmployeeIds.splice(index, 1);
    } else {
      this.selectedEmployeeIds.push(employeeId);
    }
    this.selectAllEmployees = this.selectedEmployeeIds.length === 0;
  }

  isEmployeeSelected(employeeId: number): boolean {
    return this.selectAllEmployees || this.selectedEmployeeIds.includes(employeeId);
  }

  generateAttendanceTimesheets(): void {
    this.generating = true;
    
    const payload: any = {
      startDate: this.attendanceForm.startDate,
      endDate: this.attendanceForm.endDate,
      type: 'ATTENDANCE'
    };
    
    if (!this.selectAllEmployees && this.selectedEmployeeIds.length > 0) {
      payload.employeeIds = this.selectedEmployeeIds;
    }

    this.payrollService.generateTimesheetsFromAttendance(payload).subscribe({
      next: (result) => {
        this.generating = false;
        this.showResults = true;
        this.generatedAttendanceTimesheets = result.timesheets || [];
        this.timesheetsGenerated.emit({ type: 'ATTENDANCE', count: result.generated });
      },
      error: (err) => {
        this.generating = false;
        console.error('Error generating attendance timesheets:', err);
        alert('Error generating attendance timesheets');
      }
    });
  }

  generateProjectTimesheets(): void {
    if (!this.projectForm.projectCode || !this.projectForm.projectName) {
      alert('Please enter project code and project name');
      return;
    }

    this.generating = true;
    
    const payload: any = {
      startDate: this.projectForm.startDate,
      endDate: this.projectForm.endDate,
      type: 'PROJECT',
      projectCode: this.projectForm.projectCode,
      projectName: this.projectForm.projectName
    };
    
    if (!this.selectAllEmployees && this.selectedEmployeeIds.length > 0) {
      payload.employeeIds = this.selectedEmployeeIds;
    }

    this.payrollService.generateTimesheetsFromAttendance(payload).subscribe({
      next: (result) => {
        this.generating = false;
        this.showResults = true;
        this.generatedProjectTimesheets = result.timesheets || [];
        this.timesheetsGenerated.emit({ type: 'PROJECT', count: result.generated });
      },
      error: (err) => {
        this.generating = false;
        console.error('Error generating project timesheets:', err);
        alert('Error generating project timesheets');
      }
    });
  }

  getEmployeeName(timesheet: any): string {
    if (timesheet.employee) {
      return `${timesheet.employee.firstName || ''} ${timesheet.employee.lastName || ''}`.trim();
    }
    return 'Unknown';
  }

  close(): void {
    this.showResults = false;
    this.generatedAttendanceTimesheets = [];
    this.generatedProjectTimesheets = [];
    this.closeDialog.emit();
  }
}
