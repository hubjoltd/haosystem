import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService, Employee, EmployeeBankDetail, EmployeeSalary, EmployeeEducation, EmployeeExperience, EmployeeAsset } from '../../../../services/employee.service';
import { OrganizationService, Department, Designation, Grade, JobRole, Location, CostCenter, ExpenseCenter } from '../../../../services/organization.service';
import { DocumentService, DocumentCategory, DocumentType, EmployeeDocument, ChecklistCategory, ChecklistDocumentType } from '../../../../services/document.service';
import { RecruitmentService } from '../../../../services/recruitment.service';
import { LeaveService, LeaveBalance } from '../../../../services/leave.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private orgService: OrganizationService,
    private documentService: DocumentService,
    private recruitmentService: RecruitmentService,
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef
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
    
    // Listen for query param changes (for edit mode toggle)
    this.route.queryParamMap.subscribe(params => {
      this.isEditMode = params.get('edit') === 'true';
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
        this.loading = false;
        this.cdr.detectChanges();
        // Load all sub-data at once
        this.loadAllTabData();
        // Load dropdown data only when in edit mode
        if (this.isEditMode) {
          this.loadDropdownData();
        }
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
    
    // Load all tab data at once
    this.employeeService.getBankDetails(this.employeeId).subscribe(data => this.bankDetails = data);
    this.employeeService.getSalaryHistory(this.employeeId).subscribe(data => this.salaryHistory = data);
    this.employeeService.getEducation(this.employeeId).subscribe(data => this.education = data);
    this.employeeService.getExperience(this.employeeId).subscribe(data => this.experience = data);
    this.employeeService.getAssets(this.employeeId).subscribe(data => this.assets = data);
    this.documentService.getEmployeeDocuments(this.employeeId).subscribe(data => this.documents = data);
    this.loadDocumentChecklist();
    this.loadLeaveBalances();
    this.loadRecruitmentHistory();
  }

  loadSubData() {
    if (!this.employeeId) return;
    
    this.employeeService.getBankDetails(this.employeeId).subscribe(data => this.bankDetails = data);
    this.employeeService.getSalaryHistory(this.employeeId).subscribe(data => this.salaryHistory = data);
    this.employeeService.getEducation(this.employeeId).subscribe(data => this.education = data);
    this.employeeService.getExperience(this.employeeId).subscribe(data => this.experience = data);
    this.employeeService.getAssets(this.employeeId).subscribe(data => this.assets = data);
    this.documentService.getEmployeeDocuments(this.employeeId).subscribe(data => this.documents = data);
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
    return { bankName: '', accountNumber: '', isPrimary: false, active: true };
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
    if (this.isNewEmployee && ['bank', 'salary', 'ctcHistory', 'assets', 'documents', 'leave', 'recruitment'].includes(tab)) {
      return;
    }
    this.activeTab = tab;
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
        alert('Only PDF and image files (JPEG, PNG, GIF) are allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
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
          this.router.navigate(['/app/hr/employees', created.id]);
        },
        error: (err) => {
          this.saving = false;
          console.error('Error creating employee:', err);
        }
      });
    } else if (this.employeeId) {
      this.employeeService.update(this.employeeId, this.employee).subscribe({
        next: (updated) => {
          this.saving = false;
          this.isEditMode = false;
          // Update local state instead of reloading everything
          if (updated) {
            this.employee = updated;
          }
        },
        error: (err) => {
          this.saving = false;
          console.error('Error updating employee:', err);
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
    if (!this.employeeId) return;
    
    if (this.isEditingSubItem && this.editingBank.id) {
      this.employeeService.updateBankDetail(this.editingBank.id, this.editingBank).subscribe({
        next: () => { this.showBankModal = false; this.loadSubData(); },
        error: (err) => console.error('Error updating bank detail:', err)
      });
    } else {
      this.employeeService.createBankDetail(this.employeeId, this.editingBank).subscribe({
        next: () => { this.showBankModal = false; this.loadSubData(); },
        error: (err) => console.error('Error creating bank detail:', err)
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
    this.showSalaryModal = true;
  }

  onBasicSalaryChange(): void {
    if (this.editingSalary.basicSalary && this.editingSalary.basicSalary > 0) {
      const annualSalary = this.editingSalary.basicSalary * 12;
      const hoursPerYear = 2080;
      this.editingSalary.hourlyRate = Math.round((annualSalary / hoursPerYear) * 100) / 100;
    }
  }

  saveSalary() {
    if (!this.employeeId) return;
    
    this.employeeService.createSalary(this.employeeId, this.editingSalary).subscribe({
      next: () => { this.showSalaryModal = false; this.loadSubData(); },
      error: (err) => console.error('Error creating salary:', err)
    });
  }

  openEducationModal(item?: EmployeeEducation) {
    this.isEditingSubItem = !!item;
    this.editingEducation = item ? { ...item } : this.getEmptyEducation();
    this.showEducationModal = true;
  }

  saveEducation() {
    if (!this.employeeId) return;
    
    if (this.isEditingSubItem && this.editingEducation.id) {
      this.employeeService.updateEducation(this.editingEducation.id, this.editingEducation).subscribe({
        next: () => { this.showEducationModal = false; this.loadSubData(); },
        error: (err) => console.error('Error updating education:', err)
      });
    } else {
      this.employeeService.createEducation(this.employeeId, this.editingEducation).subscribe({
        next: () => { this.showEducationModal = false; this.loadSubData(); },
        error: (err) => console.error('Error creating education:', err)
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
    if (!this.employeeId) return;
    
    if (this.isEditingSubItem && this.editingExperience.id) {
      this.employeeService.updateExperience(this.editingExperience.id, this.editingExperience).subscribe({
        next: () => { this.showExperienceModal = false; this.loadSubData(); },
        error: (err) => console.error('Error updating experience:', err)
      });
    } else {
      this.employeeService.createExperience(this.employeeId, this.editingExperience).subscribe({
        next: () => { this.showExperienceModal = false; this.loadSubData(); },
        error: (err) => console.error('Error creating experience:', err)
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
    if (!this.employeeId) return;
    
    if (this.isEditingSubItem && this.editingAsset.id) {
      this.employeeService.updateAsset(this.editingAsset.id, this.editingAsset).subscribe({
        next: () => { this.showAssetModal = false; this.loadSubData(); },
        error: (err) => console.error('Error updating asset:', err)
      });
    } else {
      this.employeeService.createAsset(this.employeeId, this.editingAsset).subscribe({
        next: () => { this.showAssetModal = false; this.loadSubData(); },
        error: (err) => console.error('Error creating asset:', err)
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
    if (!this.employeeId) return;
    
    if (this.isEditingSubItem && this.editingDocument.id) {
      this.documentService.updateDocument(this.editingDocument.id, this.editingDocument).subscribe({
        next: () => { 
          this.showDocumentModal = false; 
          this.selectedFile = null;
          this.loadSubData(); 
          this.loadDocumentChecklist();
        },
        error: (err) => console.error('Error updating document:', err)
      });
    } else {
      this.documentService.createDocument(this.employeeId, this.editingDocument).subscribe({
        next: () => { 
          this.showDocumentModal = false; 
          this.selectedFile = null;
          this.loadSubData(); 
          this.loadDocumentChecklist();
        },
        error: (err) => console.error('Error creating document:', err)
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
    this.leaveService.getEmployeeBalancesByYear(this.employeeId, this.leaveYear).subscribe({
      next: (data) => {
        this.leaveBalances = data;
        this.loadingLeaveBalances = false;
      },
      error: (err) => {
        console.error('Error loading leave balances:', err);
        this.loadingLeaveBalances = false;
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
        alert('Error initializing leave balances. Please try again.');
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
        alert('Error saving leave balance. Please try again.');
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
