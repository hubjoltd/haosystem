import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id?: number;
  code: string;
  name: string;
  description?: string;
  parent?: Department;
  costCenter?: CostCenter;
  location?: Location;
  active: boolean;
}

export interface Location {
  id?: number;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  locationType?: string;
  active: boolean;
}

export interface JobRole {
  id?: number;
  code: string;
  title: string;
  description?: string;
  department?: Department;
  grade?: Grade;
  active: boolean;
}

export interface Grade {
  id?: number;
  code: string;
  name: string;
  description?: string;
  level?: number;
  minSalary?: number;
  maxSalary?: number;
  active: boolean;
}

export interface Designation {
  id?: number;
  code: string;
  title: string;
  description?: string;
  grade?: Grade;
  active: boolean;
}

export interface CostCenter {
  id?: number;
  code: string;
  name: string;
  description?: string;
  parent?: CostCenter;
  active: boolean;
}

export interface ExpenseCenter {
  id?: number;
  code: string;
  name: string;
  description?: string;
  costCenter?: CostCenter;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private baseUrl = '/api/organization';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`);
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/departments/${id}`);
  }

  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/departments`, department);
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/departments/${id}`, department);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/departments/${id}`);
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.baseUrl}/locations`);
  }

  getLocation(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.baseUrl}/locations/${id}`);
  }

  createLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(`${this.baseUrl}/locations`, location);
  }

  updateLocation(id: number, location: Location): Observable<Location> {
    return this.http.put<Location>(`${this.baseUrl}/locations/${id}`, location);
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/locations/${id}`);
  }

  getJobRoles(): Observable<JobRole[]> {
    return this.http.get<JobRole[]>(`${this.baseUrl}/job-roles`);
  }

  getJobRole(id: number): Observable<JobRole> {
    return this.http.get<JobRole>(`${this.baseUrl}/job-roles/${id}`);
  }

  createJobRole(jobRole: JobRole): Observable<JobRole> {
    return this.http.post<JobRole>(`${this.baseUrl}/job-roles`, jobRole);
  }

  updateJobRole(id: number, jobRole: JobRole): Observable<JobRole> {
    return this.http.put<JobRole>(`${this.baseUrl}/job-roles/${id}`, jobRole);
  }

  deleteJobRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/job-roles/${id}`);
  }

  getGrades(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.baseUrl}/grades`);
  }

  getGrade(id: number): Observable<Grade> {
    return this.http.get<Grade>(`${this.baseUrl}/grades/${id}`);
  }

  createGrade(grade: Grade): Observable<Grade> {
    return this.http.post<Grade>(`${this.baseUrl}/grades`, grade);
  }

  updateGrade(id: number, grade: Grade): Observable<Grade> {
    return this.http.put<Grade>(`${this.baseUrl}/grades/${id}`, grade);
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/grades/${id}`);
  }

  getDesignations(): Observable<Designation[]> {
    return this.http.get<Designation[]>(`${this.baseUrl}/designations`);
  }

  getDesignation(id: number): Observable<Designation> {
    return this.http.get<Designation>(`${this.baseUrl}/designations/${id}`);
  }

  createDesignation(designation: Designation): Observable<Designation> {
    return this.http.post<Designation>(`${this.baseUrl}/designations`, designation);
  }

  updateDesignation(id: number, designation: Designation): Observable<Designation> {
    return this.http.put<Designation>(`${this.baseUrl}/designations/${id}`, designation);
  }

  deleteDesignation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/designations/${id}`);
  }

  getCostCenters(): Observable<CostCenter[]> {
    return this.http.get<CostCenter[]>(`${this.baseUrl}/cost-centers`);
  }

  getCostCenter(id: number): Observable<CostCenter> {
    return this.http.get<CostCenter>(`${this.baseUrl}/cost-centers/${id}`);
  }

  createCostCenter(costCenter: CostCenter): Observable<CostCenter> {
    return this.http.post<CostCenter>(`${this.baseUrl}/cost-centers`, costCenter);
  }

  updateCostCenter(id: number, costCenter: CostCenter): Observable<CostCenter> {
    return this.http.put<CostCenter>(`${this.baseUrl}/cost-centers/${id}`, costCenter);
  }

  deleteCostCenter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cost-centers/${id}`);
  }

  getExpenseCenters(): Observable<ExpenseCenter[]> {
    return this.http.get<ExpenseCenter[]>(`${this.baseUrl}/expense-centers`);
  }

  getExpenseCenter(id: number): Observable<ExpenseCenter> {
    return this.http.get<ExpenseCenter>(`${this.baseUrl}/expense-centers/${id}`);
  }

  createExpenseCenter(expenseCenter: ExpenseCenter): Observable<ExpenseCenter> {
    return this.http.post<ExpenseCenter>(`${this.baseUrl}/expense-centers`, expenseCenter);
  }

  updateExpenseCenter(id: number, expenseCenter: ExpenseCenter): Observable<ExpenseCenter> {
    return this.http.put<ExpenseCenter>(`${this.baseUrl}/expense-centers/${id}`, expenseCenter);
  }

  deleteExpenseCenter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expense-centers/${id}`);
  }
}
