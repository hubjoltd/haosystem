import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService, Employee, EmployeeBankDetail, EmployeeSalary, EmployeeEducation, EmployeeExperience, EmployeeAsset } from '../../../../services/employee.service';
import { OrganizationService, Department, Designation, Grade, JobRole, Location, CostCenter, ExpenseCenter } from '../../../../services/organization.service';
import { DocumentService, DocumentCategory, DocumentType, EmployeeDocument, ChecklistCategory, ChecklistDocumentType } from '../../../../services/document.service';
import { RecruitmentService } from '../../../../services/recruitment.service';
import { LeaveService, LeaveBalance } from '../../../../services/leave.service';
import { PayrollService, PayrollRecord, Timesheet } from '../../../../services/payroll.service';
import { AttendanceService, AttendanceRecord } from '../../../../services/attendance.service';
import { ToastService } from '../../../../services/toast.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface RecruitmentHistory {
  requisition?: any;
  jobPosting?: any;
  candidate?: any;
  interviews?: any[];
  offer?: any;
  conversionDate?: string;
}

@Component({
  selector: 'app-employee-detail',
  standalone: false,
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
  employeeId: number | null = null;
  isNewEmployee = false;
  isEditMode = false;
  activeTab = 'personal';
  
  employee: Employee = this.getEmptyEmployee();
  bankDetails: EmployeeBankDetail[] = [];
  salaryHistory: EmployeeSalary[] = [];
  education: EmployeeEducation[] = [];
  experience: EmployeeExperience[] = [];
  assets: EmployeeAsset[] = [];
  documents: EmployeeDocument[] = [];
  documentTypes: DocumentType[] = [];
  documentCategories: DocumentCategory[] = [];
  documentChecklist: ChecklistCategory[] = [];
  loadingDocumentChecklist = false;
  selectedFile: File | null = null;
  uploadingDocument = false;
  recruitmentHistory: RecruitmentHistory | null = null;
  loadingRecruitmentHistory = false;
  
  leaveBalances: LeaveBalance[] = [];
  leaveYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  loadingLeaveBalances = false;
  initializingLeave = false;
  editingLeaveBalanceId: number | null = null;
  savingLeaveBalance = false;
  originalLeaveBalance: LeaveBalance | null = null;
  
  payrollRecords: PayrollRecord[] = [];
  timesheets: Timesheet[] = [];
  loadingPayroll = false;
  
  // Weekly Timesheet
  attendanceRecords: AttendanceRecord[] = [];
  loadingAttendance = false;
  weekStartDate: string = '';
  weekEndDate: string = '';
  downloadingPdf = false;
  
  departments: Department[] = [];
  designations: Designation[] = [];
  grades: Grade[] = [];
  jobRoles: JobRole[] = [];
  locations: Location[] = [];
  costCenters: CostCenter[] = [];
  expenseCenters: ExpenseCenter[] = [];
  employees: Employee[] = [];
  
  showBankModal = false;
  showSalaryModal = false;
  showEducationModal = false;
  showExperienceModal = false;
  showAssetModal = false;
  showDocumentModal = false;
  
  editingBank: EmployeeBankDetail = this.getEmptyBankDetail();
  editingSalary: EmployeeSalary = this.getEmptySalary();
  editingEducation: EmployeeEducation = this.getEmptyEducation();
  editingExperience: EmployeeExperience = this.getEmptyExperience();
  editingAsset: EmployeeAsset = this.getEmptyAsset();
  editingDocument: EmployeeDocument = this.getEmptyDocument();
  isEditingSubItem = false;

  loading = false;
  saving = false;

  // Salary calculation fields
  workingDaysPerWeek: number = 5;
  workingHoursPerDay: number = 8;
  calculatedWeeklySalary: number = 0;
  calculatedDailySalary: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private orgService: OrganizationService,
    private documentService: DocumentService,
    private recruitmentService: RecruitmentService,
    private leaveService: LeaveService,
    private payrollService: PayrollService,
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    const currentYear = new Date().getFullYear();
    this.availableYears = [currentYear - 1, currentYear, currentYear + 1];
  }

  ngOnInit() {
    // Get the ID from the route snapshot (synchronous, immediate)
    const id = this.route.snapshot.paramMap.get('id');
    const editParam = this.route.snapshot.queryParamMap.get('edit');
    this.isEditMode = editParam === 'true';
    
    if (id === 'new') {
      this.isNewEmployee = true;
      this.isEditMode = true;
      this.loading = false;
      this.employee = this.getEmptyEmployee();
      this.loadDropdownData();
    } else if (id) {
      this.isNewEmployee = false;
      this.employeeId = parseInt(id);
      this.loading = true;
      this.loadEmployee();
    } else {
      this.loading = false;
    }
    
    // Listen for query param changes (for edit mode toggle) - only for existing employees
    this.route.queryParamMap.subscribe(params => {
      // Don't override isEditMode for new employees - they should always be in edit mode
      if (!this.isNewEmployee) {
        this.isEditMode = params.get('edit') === 'true';
      }
    });
  }

  loadDropdownData() {
    this.orgService.getDepartments().subscribe(data => this.departments = data);
    this.orgService.getDesignations().subscribe(data => this.designations = data);
    this.orgService.getGrades().subscribe(data => this.grades = data);
    this.orgService.getJobRoles().subscribe(data => this.jobRoles = data);
    this.orgService.getLocations().subscribe(data => this.locations = data);
    this.orgService.getCostCenters().subscribe(data => this.costCenters = data);
    this.orgService.getExpenseCenters().subscribe(data => this.expenseCenters = data);
    this.employeeService.getActive().subscribe(data => this.employees = data);
    this.documentService.getTypes().subscribe(data => this.documentTypes = data);
    this.documentService.getCategories().subscribe(data => this.documentCategories = data);
  }

  loadEmployee() {
    if (!this.employeeId) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    
    console.log('Loading employee:', this.employeeId);
    this.loading = true;
    
    // Safety timeout - ensure loading clears after 5 seconds max
    const timeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.cdr.detectChanges();
        console.warn('Employee loading timed out after 5 seconds');
      }
    }, 5000);
    
    this.employeeService.getById(this.employeeId).subscribe({
      next: (data) => {
        console.log('Employee loaded successfully:', data);
        clearTimeout(timeout);
        this.employee = data;
        // Ensure employeeId is set from the loaded data
        if (data.id) {
          this.employeeId = data.id;
        }
        this.loading = false;
        this.cdr.detectChanges();
        // Load all sub-data at once
        this.loadAllTabData();
        // Load dropdown data for both view and edit modes (needed for select displays)
        this.loadDropdownData();
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        clearTimeout(timeout);
        this.loading = false;
        this.cdr.detectChanges();
        // Show error but don't redirect - let user see the page
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadAllTabData() {
    if (!this.employeeId) return;
    
    // Load all tab data at once with markForCheck for OnPush change detection
    this.employeeService.getBankDetails(this.employeeId).subscribe(data => {
      this.bankDetails = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getSalaryHistory(this.employeeId).subscribe(data => {
      this.salaryHistory = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getEducation(this.employeeId).subscribe(data => {
      this.education = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getExperience(this.employeeId).subscribe(data => {
      this.experience = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getAssets(this.employeeId).subscribe(data => {
      this.assets = data;
      this.cdr.markForCheck();
    });
    this.documentService.getEmployeeDocuments(this.employeeId).subscribe(data => {
      this.documents = data;
      this.cdr.markForCheck();
    });
    this.loadDocumentChecklist();
    this.loadLeaveBalances();
    this.loadRecruitmentHistory();
  }

  loadSubData() {
    if (!this.employeeId) return;
    
    this.employeeService.getBankDetails(this.employeeId).subscribe(data => {
      this.bankDetails = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getSalaryHistory(this.employeeId).subscribe(data => {
      this.salaryHistory = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getEducation(this.employeeId).subscribe(data => {
      this.education = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getExperience(this.employeeId).subscribe(data => {
      this.experience = data;
      this.cdr.markForCheck();
    });
    this.employeeService.getAssets(this.employeeId).subscribe(data => {
      this.assets = data;
      this.cdr.markForCheck();
    });
    this.documentService.getEmployeeDocuments(this.employeeId).subscribe(data => {
      this.documents = data;
      this.cdr.markForCheck();
    });
  }

  getEmptyEmployee(): Employee {
    return {
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      active: true,
      employmentStatus: 'PROBATION',
      employmentType: 'FULL_TIME'
    };
  }

  getEmptyBankDetail(): EmployeeBankDetail {
    return { bankName: '', accountHolderName: '', accountNumber: '', isPrimary: false, active: true };
  }

  getEmptySalary(): EmployeeSalary {
    return { basicSalary: 0, effectiveFrom: '', isCurrent: true };
  }

  getEmptyEducation(): EmployeeEducation {
    return { qualification: '', institution: '' };
  }

  getEmptyExperience(): EmployeeExperience {
    return { companyName: '', designation: '', fromDate: '' };
  }

  getEmptyAsset(): EmployeeAsset {
    return { assetType: '', assetName: '', assetCode: '', serialNumber: '', issueDate: '', approvalStatus: 'PENDING' };
  }

  getEmptyDocument(): EmployeeDocument {
    return { verificationStatus: 'PENDING', reminderDays: 30 };
  }

  setTab(tab: string) {
    if (this.isNewEmployee && ['bank', 'salary', 'ctcHistory', 'assets', 'documents', 'leave', 'recruitment', 'payroll', 'timesheet'].includes(tab)) {
      return;
    }
    this.activeTab = tab;
    
    if (tab === 'payroll' && this.payrollRecords.length === 0) {
      this.loadPayrollData();
    }
    
    if (tab === 'timesheet' && this.attendanceRecords.length === 0) {
      this.initializeWeekDates();
      this.loadAttendanceRecords();
    }
  }
  
  loadPayrollData(): void {
    if (!this.employeeId) return;
    
    this.loadingPayroll = true;
    this.cdr.detectChanges();
    
    this.payrollService.getPayrollRecordsByEmployee(this.employeeId).subscribe({
      next: (records) => {
        this.payrollRecords = records;
        this.loadingPayroll = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.payrollRecords = [];
        this.loadingPayroll = false;
        this.cdr.detectChanges();
      }
    });
    
    this.payrollService.getTimesheetsByEmployee(this.employeeId).subscribe({
      next: (timesheets) => {
        this.timesheets = timesheets;
        this.cdr.detectChanges();
      },
      error: () => {
        this.timesheets = [];
        this.cdr.detectChanges();
      }
    });
  }

  initializeWeekDates(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Use Monday as week start (1 = Monday, adjust for Sunday = 0)
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysToMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    this.weekStartDate = startOfWeek.toISOString().split('T')[0];
    this.weekEndDate = endOfWeek.toISOString().split('T')[0];
  }

  loadAttendanceRecords(): void {
    if (!this.employeeId || !this.weekStartDate || !this.weekEndDate) return;
    
    // Validate date range
    if (new Date(this.weekStartDate) > new Date(this.weekEndDate)) {
      this.toastService.error('Start date must be before end date');
      return;
    }
    
    this.loadingAttendance = true;
    this.cdr.detectChanges();
    
    this.attendanceService.getByEmployeeAndDateRange(this.employeeId, this.weekStartDate, this.weekEndDate).subscribe({
      next: (records) => {
        this.attendanceRecords = records;
        this.loadingAttendance = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.attendanceRecords = [];
        this.loadingAttendance = false;
        this.cdr.detectChanges();
      }
    });
  }

  onWeekChange(): void {
    this.loadAttendanceRecords();
  }

  getTotalHours(): number {
    return this.attendanceRecords.reduce((sum, record) => {
      return sum + (record.regularHours || 0) + (record.overtimeHours || 0);
    }, 0);
  }

  getTotalOvertimeHours(): number {
    return this.attendanceRecords.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
  }

  formatAttendanceTime(time: string | undefined): string {
    if (!time) return '-';
    return time.substring(0, 5);
  }

  canDownloadPdf(): boolean {
    return !!(this.attendanceRecords.length > 0 && this.employee && this.employee.firstName);
  }

  downloadTimesheetPdf(): void {
    if (this.attendanceRecords.length === 0) {
      this.toastService.error('No records to download');
      return;
    }
    
    if (!this.employee || !this.employee.firstName) {
      this.toastService.error('Employee data not loaded');
      return;
    }
    
    this.downloadingPdf = true;
    this.cdr.detectChanges();
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text('Weekly Timesheet Report', 14, 22);
      
      const employeeName = `${this.employee.firstName || ''} ${this.employee.lastName || ''}`.trim() || 'Unknown';
      const employeeCode = this.employee.employeeCode || 'N/A';
      
      doc.setFontSize(11);
      doc.text(`Employee: ${employeeName}`, 14, 32);
      doc.text(`Code: ${employeeCode}`, 14, 38);
      doc.text(`Period: ${this.weekStartDate} to ${this.weekEndDate}`, 14, 44);
      
      // Table data
      const tableData = this.attendanceRecords.map(record => [
        record.attendanceDate,
        this.formatAttendanceTime(record.clockIn),
        this.formatAttendanceTime(record.clockOut),
        (record.regularHours || 0).toFixed(2),
        (record.overtimeHours || 0).toFixed(2),
        record.status || '-'
      ]);
      
      doc.autoTable({
        startY: 52,
        head: [['Date', 'Clock In', 'Clock Out', 'Regular Hours', 'Overtime', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 128, 128] },
        foot: [[
          'TOTAL',
          '',
          '',
          (this.getTotalHours() - this.getTotalOvertimeHours()).toFixed(2),
          this.getTotalOvertimeHours().toFixed(2),
          ''
        ]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
      
      doc.save(`timesheet_${this.employee.employeeCode}_${this.weekStartDate}.pdf`);
      this.toastService.success('PDF downloaded successfully');
    } catch (error) {
      this.toastService.error('Failed to generate PDF');
    } finally {
      this.downloadingPdf = false;
      this.cdr.detectChanges();
    }
  }

  loadDocumentChecklist() {
    if (!this.employeeId) return;
    
    this.loadingDocumentChecklist = true;
    this.documentService.getEmployeeDocumentChecklist(this.employeeId).subscribe({
      next: (data) => {
        this.documentChecklist = data;
        this.loadingDocumentChecklist = false;
      },
      error: (err) => {
        console.error('Error loading document checklist:', err);
        this.loadingDocumentChecklist = false;
      }
    });
  }

  getDocumentUploadStatus(doc: any): string {
    if (doc.status === 'PENDING') {
      return 'NOT_UPLOADED';
    }
    if (doc.verificationStatus === 'VERIFIED') {
      return 'APPROVED';
    }
    if (doc.verificationStatus === 'REJECTED') {
      return 'REJECTED';
    }
    if (doc.expiryDate) {
      const expiry = new Date(doc.expiryDate);
      if (expiry < new Date()) {
        return 'EXPIRED';
      }
    }
    return 'UPLOADED';
  }

  getDocumentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'NOT_UPLOADED': return 'badge-secondary';
      case 'UPLOADED': return 'badge-info';
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'EXPIRED': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error('Only PDF and image files (JPEG, PNG, GIF) are allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.toastService.error('File size must be less than 10MB.');
        return;
      }
      this.selectedFile = file;
      this.editingDocument.fileName = file.name;
      this.editingDocument.mimeType = file.type;
      this.editingDocument.fileSize = file.size;
    }
  }

  openDocumentModalForType(docType: any) {
    this.isEditingSubItem = false;
    this.editingDocument = {
      documentType: { id: docType.id, code: docType.code, name: docType.name, isMandatory: docType.isMandatory, hasExpiry: docType.hasExpiry, active: true },
      verificationStatus: 'PENDING',
      reminderDays: 30
    };
    this.selectedFile = null;
    this.showDocumentModal = true;
  }

  loadRecruitmentHistory() {
    if (!this.employeeId) return;
    
    this.loadingRecruitmentHistory = true;
    this.recruitmentService.getRecruitmentHistoryByEmployee(this.employeeId).subscribe({
      next: (data) => {
        this.recruitmentHistory = data;
        this.loadingRecruitmentHistory = false;
      },
      error: () => {
        this.recruitmentHistory = this.getMockRecruitmentHistory();
        this.loadingRecruitmentHistory = false;
      }
    });
  }

  getMockRecruitmentHistory(): RecruitmentHistory {
    return {
      requisition: {
        requisitionNumber: 'REQ-2024-001',
        title: 'Software Developer',
        department: { name: this.employee.department?.name || 'Engineering' },
        status: 'FILLED',
        createdAt: '2024-01-15'
      },
      jobPosting: {
        title: 'Software Developer',
        postedDate: '2024-01-20',
        closedDate: '2024-02-15',
        applicationCount: 45
      },
      candidate: {
        firstName: this.employee.firstName,
        lastName: this.employee.lastName,
        email: this.employee.email,
        appliedDate: '2024-01-25',
        source: 'LinkedIn',
        status: 'HIRED'
      },
      interviews: [
        {
          round: 1,
          type: 'PHONE_SCREENING',
          scheduledDate: '2024-02-01',
          interviewer: { firstName: 'John', lastName: 'Manager' },
          rating: 4,
          recommendation: 'PROCEED',
          feedback: 'Good communication skills'
        },
        {
          round: 2,
          type: 'TECHNICAL',
          scheduledDate: '2024-02-05',
          interviewer: { firstName: 'Sarah', lastName: 'Tech Lead' },
          rating: 5,
          recommendation: 'HIRE',
          feedback: 'Excellent technical knowledge'
        }
      ],
      offer: {
        offerNumber: 'OFF-2024-015',
        offeredSalary: 85000,
        joiningDate: this.employee.joiningDate,
        status: 'ACCEPTED',
        acceptedDate: '2024-02-12'
      },
      conversionDate: this.employee.joiningDate
    };
  }

  getInterviewTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'PHONE_SCREENING': 'Phone Screening',
      'TECHNICAL': 'Technical Interview',
      'HR': 'HR Interview',
      'MANAGER': 'Manager Round',
      'PANEL': 'Panel Interview',
      'FINAL': 'Final Round'
    };
    return labels[type] || type;
  }

  getRecommendationClass(recommendation: string): string {
    switch (recommendation) {
      case 'HIRE': return 'badge-success';
      case 'PROCEED': return 'badge-primary';
      case 'HOLD': return 'badge-warning';
      case 'REJECT': return 'badge-danger';
      default: return '';
    }
  }

  getPayFrequencyLabel(frequency: string | undefined): string {
    const labels: { [key: string]: string } = {
      'WEEKLY': 'Weekly',
      'BI_WEEKLY': 'Bi-Weekly',
      'SEMI_MONTHLY': 'Semi-Monthly',
      'MONTHLY': 'Monthly'
    };
    return frequency ? labels[frequency] || frequency : '-';
  }

  getChangeReasonLabel(reason: string | undefined): string {
    const labels: { [key: string]: string } = {
      'NEW_HIRE': 'New Hire',
      'PROMOTION': 'Promotion',
      'INCREMENT': 'Annual Increment',
      'REVISION': 'Salary Revision',
      'TRANSFER': 'Transfer',
      'CORRECTION': 'Correction'
    };
    return reason ? labels[reason] || reason : '-';
  }

  maskAccountNumber(value: string | undefined | null): string {
    if (!value) return '-';
    const lastFour = value.slice(-4);
    return `XXXX ${lastFour}`;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveEmployee() {
    if (this.saving) return;
    this.saving = true;
    
    if (this.isNewEmployee) {
      this.employeeService.create(this.employee).subscribe({
        next: (created) => {
          this.saving = false;
          this.cdr.detectChanges();
          this.toastService.success('Employee created successfully!');
          // Initialize leave balances for the new employee
          if (created.id) {
            this.leaveService.initializeBalances(created.id).subscribe({
              next: () => {
                console.log('Leave balances initialized for employee');
              },
              error: (err) => {
                console.warn('Could not initialize leave balances:', err);
              }
            });
          }
          this.router.navigate(['/app/hr/employees', created.id]);
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error creating employee:', err);
          const errorMsg = err.error?.message || err.message || 'Failed to create employee. Please try again.';
          this.toastService.error(errorMsg);
        }
      });
    } else if (this.employeeId) {
      this.employeeService.update(this.employeeId, this.employee).subscribe({
        next: (updated) => {
          console.log('Employee update success:', updated);
          this.saving = false;
          this.isEditMode = false;
          if (updated) {
            this.employee = updated;
          }
          this.cdr.detectChanges();
          this.toastService.success('Employee updated successfully!');
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error updating employee:', err);
          const errorMsg = err.error?.message || err.message || 'Failed to update employee. Please try again.';
          this.toastService.error(errorMsg);
        }
      });
    }
  }

  cancel() {
    if (this.isNewEmployee) {
      this.router.navigate(['/app/hr/employees']);
    } else {
      this.isEditMode = false;
      this.loadEmployee();
    }
  }

  goBack() {
    this.router.navigate(['/app/hr/employees']);
  }

  openBankModal(item?: EmployeeBankDetail) {
    this.isEditingSubItem = !!item;
    this.editingBank = item ? { ...item } : this.getEmptyBankDetail();
    this.showBankModal = true;
  }

  saveBankDetail() {
    if (!this.employeeId || this.saving) return;
    this.saving = true;
    
    if (this.isEditingSubItem && this.editingBank.id) {
      this.employeeService.updateBankDetail(this.editingBank.id, this.editingBank).subscribe({
        next: () => { 
          this.saving = false; 
          this.showBankModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Bank detail updated successfully');
          this.loadSubData(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error updating bank detail:', err); 
          this.toastService.error('Failed to update bank detail');
        }
      });
    } else {
      this.employeeService.createBankDetail(this.employeeId, this.editingBank).subscribe({
        next: () => { 
          this.saving = false; 
          this.showBankModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Bank detail added successfully');
          this.loadSubData(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error creating bank detail:', err); 
          this.toastService.error('Failed to add bank detail');
        }
      });
    }
  }

  deleteBankDetail(item: EmployeeBankDetail) {
    if (item.id && confirm('Delete this bank detail?')) {
      this.employeeService.deleteBankDetail(item.id).subscribe({
        next: () => this.loadSubData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  openSalaryModal() {
    this.editingSalary = this.getEmptySalary();
    // Reset calculation fields to defaults
    this.workingDaysPerWeek = 5;
    this.workingHoursPerDay = 8;
    this.calculatedWeeklySalary = 0;
    this.calculatedDailySalary = 0;
    this.showSalaryModal = true;
  }

  onBasicSalaryChange(): void {
    // Formula:
    // 1. Weekly Salary = Annual Salary / 52 weeks
    // 2. Daily Salary = Weekly Salary / Working Days Per Week
    // 3. Hourly Rate = Daily Salary / Working Hours Per Day
    
    if (this.editingSalary.basicSalary && this.editingSalary.basicSalary > 0) {
      const annualSalary = this.editingSalary.basicSalary;
      const daysPerWeek = this.workingDaysPerWeek || 5;
      const hoursPerDay = this.workingHoursPerDay || 8;
      
      // Step 1: Calculate weekly salary
      this.calculatedWeeklySalary = Math.round((annualSalary / 52) * 100) / 100;
      
      // Step 2: Calculate daily salary
      this.calculatedDailySalary = Math.round((this.calculatedWeeklySalary / daysPerWeek) * 100) / 100;
      
      // Step 3: Calculate hourly rate
      this.editingSalary.hourlyRate = Math.round((this.calculatedDailySalary / hoursPerDay) * 100) / 100;
    } else {
      this.calculatedWeeklySalary = 0;
      this.calculatedDailySalary = 0;
      this.editingSalary.hourlyRate = 0;
    }
  }

  saveSalary() {
    if (!this.employeeId || this.saving) return;
    this.saving = true;
    
    this.employeeService.createSalary(this.employeeId, this.editingSalary).subscribe({
      next: () => { 
        this.saving = false;
        this.showSalaryModal = false; 
        this.cdr.detectChanges();
        this.toastService.success('Salary added successfully');
        this.loadSubData(); 
      },
      error: (err) => {
        this.saving = false;
        this.cdr.detectChanges();
        console.error('Error creating salary:', err);
        this.toastService.error('Failed to add salary');
      }
    });
  }

  openEducationModal(item?: EmployeeEducation) {
    this.isEditingSubItem = !!item;
    this.editingEducation = item ? { ...item } : this.getEmptyEducation();
    this.showEducationModal = true;
  }

  saveEducation() {
    if (!this.employeeId || this.saving) return;
    this.saving = true;
    
    if (this.isEditingSubItem && this.editingEducation.id) {
      this.employeeService.updateEducation(this.editingEducation.id, this.editingEducation).subscribe({
        next: () => { 
          this.saving = false;
          this.showEducationModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Education updated successfully');
          this.loadSubData(); 
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error updating education:', err);
          this.toastService.error('Failed to update education');
        }
      });
    } else {
      this.employeeService.createEducation(this.employeeId, this.editingEducation).subscribe({
        next: () => { 
          this.saving = false;
          this.showEducationModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Education added successfully');
          this.loadSubData(); 
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error creating education:', err);
          this.toastService.error('Failed to add education');
        }
      });
    }
  }

  deleteEducation(item: EmployeeEducation) {
    if (item.id && confirm('Delete this education record?')) {
      this.employeeService.deleteEducation(item.id).subscribe({
        next: () => this.loadSubData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  openExperienceModal(item?: EmployeeExperience) {
    this.isEditingSubItem = !!item;
    this.editingExperience = item ? { ...item } : this.getEmptyExperience();
    this.showExperienceModal = true;
  }

  saveExperience() {
    if (!this.employeeId || this.saving) return;
    this.saving = true;
    
    if (this.isEditingSubItem && this.editingExperience.id) {
      this.employeeService.updateExperience(this.editingExperience.id, this.editingExperience).subscribe({
        next: () => { 
          this.saving = false;
          this.showExperienceModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Experience updated successfully');
          this.loadSubData(); 
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error updating experience:', err);
          this.toastService.error('Failed to update experience');
        }
      });
    } else {
      this.employeeService.createExperience(this.employeeId, this.editingExperience).subscribe({
        next: () => { 
          this.saving = false;
          this.showExperienceModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Experience added successfully');
          this.loadSubData(); 
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error creating experience:', err);
          this.toastService.error('Failed to add experience');
        }
      });
    }
  }

  deleteExperience(item: EmployeeExperience) {
    if (item.id && confirm('Delete this experience record?')) {
      this.employeeService.deleteExperience(item.id).subscribe({
        next: () => this.loadSubData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  openAssetModal(item?: EmployeeAsset) {
    this.isEditingSubItem = !!item;
    this.editingAsset = item ? { ...item } : this.getEmptyAsset();
    this.showAssetModal = true;
  }

  saveAsset() {
    if (!this.employeeId || this.saving) return;
    this.saving = true;
    
    if (this.isEditingSubItem && this.editingAsset.id) {
      this.employeeService.updateAsset(this.editingAsset.id, this.editingAsset).subscribe({
        next: () => { 
          this.saving = false;
          this.showAssetModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Asset updated successfully');
          this.loadSubData(); 
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error updating asset:', err);
          this.toastService.error('Failed to update asset');
        }
      });
    } else {
      this.employeeService.createAsset(this.employeeId, this.editingAsset).subscribe({
        next: () => { 
          this.saving = false;
          this.showAssetModal = false; 
          this.cdr.detectChanges();
          this.toastService.success('Asset added successfully');
          this.loadSubData(); 
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error creating asset:', err);
          this.toastService.error('Failed to add asset');
        }
      });
    }
  }

  approveAsset(item: EmployeeAsset, status: string) {
    if (item.id) {
      this.employeeService.approveAsset(item.id, status).subscribe({
        next: () => this.loadSubData(),
        error: (err) => console.error('Error approving asset:', err)
      });
    }
  }

  deleteAsset(item: EmployeeAsset) {
    if (item.id && confirm('Delete this asset record?')) {
      this.employeeService.deleteAsset(item.id).subscribe({
        next: () => this.loadSubData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  compareById(obj1: any, obj2: any): boolean {
    return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
  }

  openDocumentModal(item?: EmployeeDocument) {
    this.isEditingSubItem = !!item;
    this.editingDocument = item ? { ...item } : this.getEmptyDocument();
    this.selectedFile = null;
    this.showDocumentModal = true;
  }

  saveDocument() {
    if (!this.employeeId || this.saving) return;
    this.saving = true;
    
    if (this.isEditingSubItem && this.editingDocument.id) {
      this.documentService.updateDocument(this.editingDocument.id, this.editingDocument).subscribe({
        next: () => { 
          this.saving = false;
          this.showDocumentModal = false; 
          this.selectedFile = null;
          this.cdr.detectChanges();
          this.toastService.success('Document updated successfully');
          this.loadSubData(); 
          this.loadDocumentChecklist();
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error updating document:', err);
          this.toastService.error('Failed to update document');
        }
      });
    } else {
      this.documentService.createDocument(this.employeeId, this.editingDocument).subscribe({
        next: () => { 
          this.saving = false;
          this.showDocumentModal = false; 
          this.selectedFile = null;
          this.cdr.detectChanges();
          this.toastService.success('Document added successfully');
          this.loadSubData(); 
          this.loadDocumentChecklist();
        },
        error: (err) => {
          this.saving = false;
          this.cdr.detectChanges();
          console.error('Error creating document:', err);
          this.toastService.error('Failed to add document');
        }
      });
    }
  }

  verifyDocument(item: EmployeeDocument | { id: number | undefined }, status: string) {
    if (item.id) {
      this.documentService.verifyDocument(item.id, status).subscribe({
        next: () => {
          this.loadSubData();
          this.loadDocumentChecklist();
        },
        error: (err) => console.error('Error verifying document:', err)
      });
    }
  }

  deleteDocument(item: EmployeeDocument | { id: number | undefined }) {
    if (item.id && confirm('Delete this document?')) {
      this.documentService.deleteDocument(item.id).subscribe({
        next: () => {
          this.loadSubData();
          this.loadDocumentChecklist();
        },
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  verifyDocumentById(documentId: number | undefined, status: string) {
    if (documentId) {
      this.documentService.verifyDocument(documentId, status).subscribe({
        next: () => {
          this.loadSubData();
          this.loadDocumentChecklist();
        },
        error: (err) => console.error('Error verifying document:', err)
      });
    }
  }

  deleteDocumentById(documentId: number | undefined) {
    if (documentId && confirm('Delete this document?')) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: () => {
          this.loadSubData();
          this.loadDocumentChecklist();
        },
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  editDocumentFromChecklist(docType: ChecklistDocumentType) {
    if (docType.documentId) {
      this.documentService.getDocumentById(docType.documentId).subscribe({
        next: (doc) => {
          this.openDocumentModal(doc);
        },
        error: (err) => {
          console.error('Error loading document:', err);
          this.editingDocument = {
            ...this.getEmptyDocument(),
            id: docType.documentId,
            documentType: {
              id: docType.id,
              code: docType.code,
              name: docType.name,
              description: docType.description,
              isMandatory: docType.isMandatory,
              hasExpiry: docType.hasExpiry,
              active: docType.active ?? true
            },
            verificationStatus: docType.verificationStatus || 'PENDING'
          };
          this.isEditingSubItem = true;
          this.selectedFile = null;
          this.showDocumentModal = true;
        }
      });
    }
  }

  getDocumentStatusClass(status: string): string {
    switch (status) {
      case 'VERIFIED': return 'status-verified';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  isDocumentExpiring(doc: EmployeeDocument): boolean {
    if (!doc.expiryDate) return false;
    const expiry = new Date(doc.expiryDate);
    const today = new Date();
    const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  }

  isDocumentExpired(doc: EmployeeDocument): boolean {
    if (!doc.expiryDate) return false;
    return new Date(doc.expiryDate) < new Date();
  }

  loadLeaveBalances(): void {
    if (!this.employeeId) return;
    
    this.loadingLeaveBalances = true;
    this.cdr.markForCheck();
    this.leaveService.getEmployeeBalancesByYear(this.employeeId, this.leaveYear).subscribe({
      next: (data) => {
        this.leaveBalances = data;
        this.loadingLeaveBalances = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading leave balances:', err);
        this.loadingLeaveBalances = false;
        this.cdr.markForCheck();
      }
    });
  }

  initializeLeaveBalances(): void {
    if (!this.employeeId) return;
    
    this.initializingLeave = true;
    this.leaveService.initializeBalances(this.employeeId).subscribe({
      next: (response) => {
        this.leaveService.getEmployeeBalancesByYear(this.employeeId!, this.leaveYear).subscribe({
          next: (data) => {
            this.leaveBalances = data;
            this.initializingLeave = false;
          },
          error: () => {
            this.initializingLeave = false;
          }
        });
      },
      error: (err) => {
        console.error('Error initializing leave balances:', err);
        this.initializingLeave = false;
        this.toastService.error('Error initializing leave balances. Please try again.');
      }
    });
  }

  editLeaveBalance(balance: LeaveBalance): void {
    this.editingLeaveBalanceId = balance.id || null;
    this.originalLeaveBalance = { ...balance };
  }

  cancelLeaveBalanceEdit(): void {
    if (this.originalLeaveBalance && this.editingLeaveBalanceId) {
      const index = this.leaveBalances.findIndex(b => b.id === this.editingLeaveBalanceId);
      if (index !== -1) {
        this.leaveBalances[index] = { ...this.originalLeaveBalance };
      }
    }
    this.editingLeaveBalanceId = null;
    this.originalLeaveBalance = null;
  }

  saveLeaveBalance(balance: LeaveBalance): void {
    if (!balance.id) return;
    
    this.savingLeaveBalance = true;
    this.leaveService.updateBalance(balance.id, balance).subscribe({
      next: () => {
        this.editingLeaveBalanceId = null;
        this.originalLeaveBalance = null;
        this.savingLeaveBalance = false;
        this.loadLeaveBalances();
      },
      error: (err) => {
        console.error('Error saving leave balance:', err);
        this.savingLeaveBalance = false;
        this.toastService.error('Error saving leave balance. Please try again.');
      }
    });
  }

  getLeaveAvailable(balance: LeaveBalance): number {
    const total = (balance.openingBalance || 0) + (balance.credited || 0) + (balance.carryForward || 0);
    return total - (balance.used || 0) - (balance.pending || 0) - (balance.lapsed || 0) - (balance.encashed || 0);
  }

  getTotalOpening(): number {
    return this.leaveBalances.reduce((sum, b) => sum + (b.openingBalance || 0), 0);
  }

  getTotalCredited(): number {
    return this.leaveBalances.reduce((sum, b) => sum + (b.credited || 0), 0);
  }

  getTotalCarryForward(): number {
    return this.leaveBalances.reduce((sum, b) => sum + (b.carryForward || 0), 0);
  }

  getTotalUsed(): number {
    return this.leaveBalances.reduce((sum, b) => sum + (b.used || 0), 0);
  }

  getTotalPending(): number {
    return this.leaveBalances.reduce((sum, b) => sum + (b.pending || 0), 0);
  }

  getTotalAvailable(): number {
    return this.leaveBalances.reduce((sum, b) => sum + this.getLeaveAvailable(b), 0);
  }
}
