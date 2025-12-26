import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department, Location, Grade, Designation, CostCenter, ExpenseCenter, JobRole } from './organization.service';

export interface Employee {
  id?: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodGroup?: string;
  permanentAddress?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentCountry?: string;
  permanentZipCode?: string;
  currentAddress?: string;
  currentCity?: string;
  currentState?: string;
  currentCountry?: string;
  currentZipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  photoUrl?: string;
  ssn?: string;
  nationalId?: string;
  citizenship?: string;
  visaType?: string;
  visaExpiry?: string;
  i9Status?: string;
  i9ExpiryDate?: string;
  workAuthorizationType?: string;
  panNumber?: string;
  aadharNumber?: string;
  passportNumber?: string;
  passportExpiry?: string;
  department?: Department;
  designation?: Designation;
  grade?: Grade;
  jobRole?: JobRole;
  location?: Location;
  costCenter?: CostCenter;
  expenseCenter?: ExpenseCenter;
  reportingManager?: Employee;
  joiningDate?: string;
  confirmationDate?: string;
  resignationDate?: string;
  lastWorkingDate?: string;
  employmentStatus?: string;
  employmentType?: string;
  noticePeriodDays?: number;
  probationMonths?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface EmployeeBankDetail {
  id?: number;
  employee?: Employee;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  accountType?: string;
  ifscCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  paymentMethod?: string;
  isPrimary: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSalary {
  id?: number;
  employee?: Employee;
  basicSalary: number;
  hraAmount?: number;
  daAmount?: number;
  taAmount?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  otherAllowances?: number;
  pfDeduction?: number;
  otherDeductions?: number;
  grossSalary?: number;
  netSalary?: number;
  ctcAnnual?: number;
  hourlyRate?: number;
  payFrequency?: string;
  changeReason?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isCurrent: boolean;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface EmployeeEducation {
  id?: number;
  employee?: Employee;
  qualification: string;
  specialization?: string;
  institution: string;
  university?: string;
  yearOfPassing?: string;
  percentage?: string;
  grade?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeExperience {
  id?: number;
  employee?: Employee;
  companyName: string;
  designation: string;
  fromDate: string;
  toDate?: string;
  location?: string;
  responsibilities?: string;
  reasonForLeaving?: string;
  lastSalary?: string;
  referenceContact?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeAsset {
  id?: number;
  employee?: Employee;
  assetType: string;
  assetName: string;
  assetTag?: string;
  serialNumber?: string;
  issuedDate?: string;
  returnDate?: string;
  condition?: string;
  approvalStatus: string;
  approvedBy?: string;
  approvedAt?: string;
  remarks?: string;
  createdAt?: string;
  createdBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = '/api/employees';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  getActive(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/active`);
  }

  search(query: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/search`, { params: { query } });
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  create(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  update(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByDepartment(departmentId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/by-department/${departmentId}`);
  }

  getByDesignation(designationId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/by-designation/${designationId}`);
  }

  getByLocation(locationId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/by-location/${locationId}`);
  }

  getByManager(managerId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/by-manager/${managerId}`);
  }

  getBankDetails(employeeId: number): Observable<EmployeeBankDetail[]> {
    return this.http.get<EmployeeBankDetail[]>(`${this.baseUrl}/${employeeId}/bank-details`);
  }

  createBankDetail(employeeId: number, detail: EmployeeBankDetail): Observable<EmployeeBankDetail> {
    return this.http.post<EmployeeBankDetail>(`${this.baseUrl}/${employeeId}/bank-details`, detail);
  }

  updateBankDetail(id: number, detail: EmployeeBankDetail): Observable<EmployeeBankDetail> {
    return this.http.put<EmployeeBankDetail>(`${this.baseUrl}/bank-details/${id}`, detail);
  }

  deleteBankDetail(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bank-details/${id}`);
  }

  getSalaryHistory(employeeId: number): Observable<EmployeeSalary[]> {
    return this.http.get<EmployeeSalary[]>(`${this.baseUrl}/${employeeId}/salary`);
  }

  getCurrentSalary(employeeId: number): Observable<EmployeeSalary> {
    return this.http.get<EmployeeSalary>(`${this.baseUrl}/${employeeId}/salary/current`);
  }

  createSalary(employeeId: number, salary: EmployeeSalary): Observable<EmployeeSalary> {
    return this.http.post<EmployeeSalary>(`${this.baseUrl}/${employeeId}/salary`, salary);
  }

  getEducation(employeeId: number): Observable<EmployeeEducation[]> {
    return this.http.get<EmployeeEducation[]>(`${this.baseUrl}/${employeeId}/education`);
  }

  createEducation(employeeId: number, education: EmployeeEducation): Observable<EmployeeEducation> {
    return this.http.post<EmployeeEducation>(`${this.baseUrl}/${employeeId}/education`, education);
  }

  updateEducation(id: number, education: EmployeeEducation): Observable<EmployeeEducation> {
    return this.http.put<EmployeeEducation>(`${this.baseUrl}/education/${id}`, education);
  }

  deleteEducation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/education/${id}`);
  }

  getExperience(employeeId: number): Observable<EmployeeExperience[]> {
    return this.http.get<EmployeeExperience[]>(`${this.baseUrl}/${employeeId}/experience`);
  }

  createExperience(employeeId: number, experience: EmployeeExperience): Observable<EmployeeExperience> {
    return this.http.post<EmployeeExperience>(`${this.baseUrl}/${employeeId}/experience`, experience);
  }

  updateExperience(id: number, experience: EmployeeExperience): Observable<EmployeeExperience> {
    return this.http.put<EmployeeExperience>(`${this.baseUrl}/experience/${id}`, experience);
  }

  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/experience/${id}`);
  }

  getAssets(employeeId: number): Observable<EmployeeAsset[]> {
    return this.http.get<EmployeeAsset[]>(`${this.baseUrl}/${employeeId}/assets`);
  }

  createAsset(employeeId: number, asset: EmployeeAsset): Observable<EmployeeAsset> {
    return this.http.post<EmployeeAsset>(`${this.baseUrl}/${employeeId}/assets`, asset);
  }

  updateAsset(id: number, asset: EmployeeAsset): Observable<EmployeeAsset> {
    return this.http.put<EmployeeAsset>(`${this.baseUrl}/assets/${id}`, asset);
  }

  approveAsset(id: number, status: string): Observable<EmployeeAsset> {
    return this.http.put<EmployeeAsset>(`${this.baseUrl}/assets/${id}/approve`, null, { params: { status } });
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/assets/${id}`);
  }
}
