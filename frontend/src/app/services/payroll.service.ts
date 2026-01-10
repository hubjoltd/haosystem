import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalaryHead {
  id?: number;
  code: string;
  name: string;
  description?: string;
  headType: string;
  category: string;
  calculationType?: string;
  defaultValue?: number;
  percentageOf?: number;
  basedOnHead?: string;
  isTaxable?: boolean;
  isStatutory?: boolean;
  affectsGrossPay?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  applicableTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayFrequency {
  id?: number;
  code: string;
  name: string;
  description?: string;
  periodsPerYear: number;
  payDayOfWeek?: number;
  payDayOfMonth?: number;
  secondPayDayOfMonth?: number;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OvertimeRule {
  id?: number;
  code: string;
  name: string;
  description?: string;
  ruleType: string;
  multiplier: number;
  minHoursThreshold?: number;
  thresholdType?: string;
  maxOvertimeHours?: number;
  maxOvertimePeriod?: string;
  requiresApproval?: boolean;
  isActive?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxRule {
  id?: number;
  code: string;
  name: string;
  description?: string;
  taxType: string;
  stateCode?: string;
  rate: number;
  minIncome?: number;
  maxIncome?: number;
  fixedAmount?: number;
  calculationBasis?: string;
  employeeContribution?: boolean;
  employerContribution?: boolean;
  employerRate?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  taxYear?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatutoryRule {
  id?: number;
  code: string;
  name: string;
  description?: string;
  ruleType: string;
  employeeRate?: number;
  employerRate?: number;
  wageBase?: number;
  minWage?: number;
  maxContribution?: number;
  stateCode?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  applicableYear?: number;
  frequency?: string;
  isMandatory?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Timesheet {
  id?: number;
  timesheetNumber: string;
  employee?: any;
  employeeId?: number;
  payFrequency?: PayFrequency;
  periodStartDate: string;
  periodEndDate: string;
  totalRegularHours?: number;
  totalOvertimeHours?: number;
  totalHours?: number;
  workingDays?: number;
  presentDays?: number;
  absentDays?: number;
  leaveDays?: number;
  holidayDays?: number;
  status: string;
  approvedBy?: any;
  approvedAt?: string;
  remarks?: string;
  approverRemarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollRun {
  id?: number;
  payrollRunNumber: string;
  description?: string;
  payFrequency?: PayFrequency;
  periodStartDate: string;
  periodEndDate: string;
  payDate: string;
  totalEmployees?: number;
  totalGrossPay?: number;
  totalDeductions?: number;
  totalTaxes?: number;
  totalNetPay?: number;
  totalEmployerContributions?: number;
  status: string;
  createdBy?: any;
  approvedBy?: any;
  approvedAt?: string;
  processedBy?: any;
  processedAt?: string;
  remarks?: string;
  isPostedToAccounts?: boolean;
  postedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollRecord {
  id?: number;
  payrollRun?: PayrollRun;
  employee?: any;
  timesheet?: Timesheet;
  employeeType?: string;
  annualSalary?: number;
  hourlyRate?: number;
  regularHours?: number;
  overtimeHours?: number;
  basePay?: number;
  overtimePay?: number;
  bonuses?: number;
  reimbursements?: number;
  grossPay?: number;
  preTaxDeductions?: number;
  healthInsurance?: number;
  dentalInsurance?: number;
  visionInsurance?: number;
  retirement401k?: number;
  hsaContribution?: number;
  otherPreTaxDeductions?: number;
  taxableIncome?: number;
  federalTax?: number;
  stateTax?: number;
  localTax?: number;
  socialSecurityTax?: number;
  medicareTax?: number;
  disabilityTax?: number;
  totalTaxes?: number;
  postTaxDeductions?: number;
  loanDeductions?: number;
  garnishments?: number;
  otherPostTaxDeductions?: number;
  totalDeductions?: number;
  netPay?: number;
  employerSocialSecurity?: number;
  employerMedicare?: number;
  employerHealthContribution?: number;
  employer401kMatch?: number;
  totalEmployerContributions?: number;
  projectCode?: string;
  costCenterCode?: string;
  status?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeBenefit {
  id?: number;
  employee?: any;
  employeeId?: number;
  benefitType: string;
  planName?: string;
  coverageLevel?: string;
  employeeContribution?: number;
  employerContribution?: number;
  annualEmployeeContribution?: number;
  annualEmployerContribution?: number;
  contributionType?: string;
  contributionPercentage?: number;
  employerMatchPercentage?: number;
  employerMatchLimit?: number;
  enrollmentDate?: string;
  effectiveDate?: string;
  terminationDate?: string;
  isPreTax?: boolean;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcessedPayrollRecord {
  sno: number;
  empId: string;
  employeeId?: number;
  name: string;
  project: string;
  hours: number;
  hourlyRate: number;
  gross: number;
  federal: number;
  state: number;
  socSec: number;
  medicare: number;
  netPay: number;
  status: 'Calculated' | 'Processed' | 'Released' | 'Hold';
  periodStart: string;
  periodEnd: string;
  processedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private rulesUrl = '/api/payroll/rules';
  private payrollUrl = '/api/payroll';
  
  private processedPayrollRecords: ProcessedPayrollRecord[] = [];

  constructor(private http: HttpClient) {}
  
  addProcessedPayrollRecords(records: ProcessedPayrollRecord[]): void {
    this.processedPayrollRecords.push(...records);
  }
  
  getProcessedPayrollRecords(): ProcessedPayrollRecord[] {
    return [...this.processedPayrollRecords];
  }
  
  getProcessedPayrollRecordsByStatus(status: 'Calculated' | 'Processed' | 'Released' | 'Hold'): ProcessedPayrollRecord[] {
    return this.processedPayrollRecords.filter(r => r.status === status);
  }
  
  getReleasedPayrollRecords(): ProcessedPayrollRecord[] {
    return this.processedPayrollRecords.filter(r => r.status === 'Released');
  }
  
  updatePayrollRecordStatus(employeeId: number, periodStart: string, newStatus: 'Calculated' | 'Processed' | 'Released' | 'Hold'): void {
    const record = this.processedPayrollRecords.find(r => r.employeeId === employeeId && r.periodStart === periodStart);
    if (record) {
      record.status = newStatus;
    }
  }
  
  releasePayrollRecords(employeeIds: number[], periodStart: string): void {
    this.processedPayrollRecords.forEach(r => {
      if (employeeIds.includes(r.employeeId!) && r.periodStart === periodStart && r.status === 'Processed') {
        r.status = 'Released';
      }
    });
  }
  
  getProcessedPayrollRecordsByEmployee(employeeId: number): ProcessedPayrollRecord[] {
    return this.processedPayrollRecords.filter(r => r.employeeId === employeeId);
  }
  
  clearProcessedPayrollRecords(): void {
    this.processedPayrollRecords = [];
  }

  getSalaryHeads(): Observable<SalaryHead[]> {
    return this.http.get<SalaryHead[]>(`${this.rulesUrl}/salary-heads`);
  }

  getAllSalaryHeads(): Observable<SalaryHead[]> {
    return this.http.get<SalaryHead[]>(`${this.rulesUrl}/salary-heads/all`);
  }

  getSalaryHead(id: number): Observable<SalaryHead> {
    return this.http.get<SalaryHead>(`${this.rulesUrl}/salary-heads/${id}`);
  }

  getSalaryHeadsByType(type: string): Observable<SalaryHead[]> {
    return this.http.get<SalaryHead[]>(`${this.rulesUrl}/salary-heads/type/${type}`);
  }

  createSalaryHead(salaryHead: SalaryHead): Observable<SalaryHead> {
    return this.http.post<SalaryHead>(`${this.rulesUrl}/salary-heads`, salaryHead);
  }

  updateSalaryHead(id: number, salaryHead: SalaryHead): Observable<SalaryHead> {
    return this.http.put<SalaryHead>(`${this.rulesUrl}/salary-heads/${id}`, salaryHead);
  }

  deleteSalaryHead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rulesUrl}/salary-heads/${id}`);
  }

  getPayFrequencies(): Observable<PayFrequency[]> {
    return this.http.get<PayFrequency[]>(`${this.rulesUrl}/pay-frequencies`);
  }

  getAllPayFrequencies(): Observable<PayFrequency[]> {
    return this.http.get<PayFrequency[]>(`${this.rulesUrl}/pay-frequencies/all`);
  }

  getPayFrequency(id: number): Observable<PayFrequency> {
    return this.http.get<PayFrequency>(`${this.rulesUrl}/pay-frequencies/${id}`);
  }

  createPayFrequency(payFrequency: PayFrequency): Observable<PayFrequency> {
    return this.http.post<PayFrequency>(`${this.rulesUrl}/pay-frequencies`, payFrequency);
  }

  updatePayFrequency(id: number, payFrequency: PayFrequency): Observable<PayFrequency> {
    return this.http.put<PayFrequency>(`${this.rulesUrl}/pay-frequencies/${id}`, payFrequency);
  }

  deletePayFrequency(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rulesUrl}/pay-frequencies/${id}`);
  }

  getOvertimeRules(): Observable<OvertimeRule[]> {
    return this.http.get<OvertimeRule[]>(`${this.rulesUrl}/overtime-rules`);
  }

  getAllOvertimeRules(): Observable<OvertimeRule[]> {
    return this.http.get<OvertimeRule[]>(`${this.rulesUrl}/overtime-rules/all`);
  }

  getOvertimeRule(id: number): Observable<OvertimeRule> {
    return this.http.get<OvertimeRule>(`${this.rulesUrl}/overtime-rules/${id}`);
  }

  createOvertimeRule(rule: OvertimeRule): Observable<OvertimeRule> {
    return this.http.post<OvertimeRule>(`${this.rulesUrl}/overtime-rules`, rule);
  }

  updateOvertimeRule(id: number, rule: OvertimeRule): Observable<OvertimeRule> {
    return this.http.put<OvertimeRule>(`${this.rulesUrl}/overtime-rules/${id}`, rule);
  }

  deleteOvertimeRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rulesUrl}/overtime-rules/${id}`);
  }

  getTaxRules(): Observable<TaxRule[]> {
    return this.http.get<TaxRule[]>(`${this.rulesUrl}/tax-rules`);
  }

  getAllTaxRules(): Observable<TaxRule[]> {
    return this.http.get<TaxRule[]>(`${this.rulesUrl}/tax-rules/all`);
  }

  getTaxRule(id: number): Observable<TaxRule> {
    return this.http.get<TaxRule>(`${this.rulesUrl}/tax-rules/${id}`);
  }

  getTaxRulesByType(type: string): Observable<TaxRule[]> {
    return this.http.get<TaxRule[]>(`${this.rulesUrl}/tax-rules/type/${type}`);
  }

  createTaxRule(rule: TaxRule): Observable<TaxRule> {
    return this.http.post<TaxRule>(`${this.rulesUrl}/tax-rules`, rule);
  }

  updateTaxRule(id: number, rule: TaxRule): Observable<TaxRule> {
    return this.http.put<TaxRule>(`${this.rulesUrl}/tax-rules/${id}`, rule);
  }

  deleteTaxRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rulesUrl}/tax-rules/${id}`);
  }

  getStatutoryRules(): Observable<StatutoryRule[]> {
    return this.http.get<StatutoryRule[]>(`${this.rulesUrl}/statutory-rules`);
  }

  getAllStatutoryRules(): Observable<StatutoryRule[]> {
    return this.http.get<StatutoryRule[]>(`${this.rulesUrl}/statutory-rules/all`);
  }

  getStatutoryRule(id: number): Observable<StatutoryRule> {
    return this.http.get<StatutoryRule>(`${this.rulesUrl}/statutory-rules/${id}`);
  }

  createStatutoryRule(rule: StatutoryRule): Observable<StatutoryRule> {
    return this.http.post<StatutoryRule>(`${this.rulesUrl}/statutory-rules`, rule);
  }

  updateStatutoryRule(id: number, rule: StatutoryRule): Observable<StatutoryRule> {
    return this.http.put<StatutoryRule>(`${this.rulesUrl}/statutory-rules/${id}`, rule);
  }

  deleteStatutoryRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rulesUrl}/statutory-rules/${id}`);
  }

  getTimesheets(): Observable<Timesheet[]> {
    return this.http.get<Timesheet[]>(`${this.payrollUrl}/timesheets`);
  }

  getTimesheet(id: number): Observable<Timesheet> {
    return this.http.get<Timesheet>(`${this.payrollUrl}/timesheets/${id}`);
  }

  getTimesheetsByEmployee(employeeId: number): Observable<Timesheet[]> {
    return this.http.get<Timesheet[]>(`${this.payrollUrl}/timesheets/employee/${employeeId}`);
  }

  getTimesheetsByStatus(status: string): Observable<Timesheet[]> {
    return this.http.get<Timesheet[]>(`${this.payrollUrl}/timesheets/status/${status}`);
  }

  createTimesheet(timesheet: any): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.payrollUrl}/timesheets`, timesheet);
  }

  generateTimesheets(startDate: string, endDate: string): Observable<any> {
    return this.http.post<any>(`${this.payrollUrl}/timesheets/generate`, { startDate, endDate });
  }

  approveTimesheet(id: number, data: any): Observable<Timesheet> {
    return this.http.put<Timesheet>(`${this.payrollUrl}/timesheets/${id}/approve`, data);
  }

  rejectTimesheet(id: number, data: any): Observable<Timesheet> {
    return this.http.put<Timesheet>(`${this.payrollUrl}/timesheets/${id}/reject`, data);
  }

  getPayrollRuns(): Observable<PayrollRun[]> {
    return this.http.get<PayrollRun[]>(`${this.payrollUrl}/runs`);
  }

  getPayrollRun(id: number): Observable<PayrollRun> {
    return this.http.get<PayrollRun>(`${this.payrollUrl}/runs/${id}`);
  }

  getPayrollRecordsByRun(runId: number): Observable<PayrollRecord[]> {
    return this.http.get<PayrollRecord[]>(`${this.payrollUrl}/runs/${runId}/records`);
  }

  createPayrollRun(run: any): Observable<PayrollRun> {
    return this.http.post<PayrollRun>(`${this.payrollUrl}/runs`, run);
  }

  calculatePayroll(runId: number): Observable<PayrollRun> {
    return this.http.post<PayrollRun>(`${this.payrollUrl}/runs/${runId}/calculate`, {});
  }

  processPayroll(runId: number, data: any): Observable<PayrollRun> {
    return this.http.post<PayrollRun>(`${this.payrollUrl}/runs/${runId}/process`, data);
  }

  approvePayrollRun(id: number, data: any): Observable<PayrollRun> {
    return this.http.put<PayrollRun>(`${this.payrollUrl}/runs/${id}/approve`, data);
  }

  getPayrollRecordsByEmployee(employeeId: number): Observable<PayrollRecord[]> {
    return this.http.get<PayrollRecord[]>(`${this.payrollUrl}/records/employee/${employeeId}`);
  }

  getPaystubs(employeeId: number): Observable<PayrollRecord[]> {
    return this.http.get<PayrollRecord[]>(`${this.payrollUrl}/records/employee/${employeeId}/paystubs`);
  }

  getEmployeeBenefits(employeeId: number): Observable<EmployeeBenefit[]> {
    return this.http.get<EmployeeBenefit[]>(`${this.payrollUrl}/benefits/employee/${employeeId}`);
  }

  createEmployeeBenefit(benefit: any): Observable<EmployeeBenefit> {
    return this.http.post<EmployeeBenefit>(`${this.payrollUrl}/benefits`, benefit);
  }

  updateEmployeeBenefit(id: number, benefit: EmployeeBenefit): Observable<EmployeeBenefit> {
    return this.http.put<EmployeeBenefit>(`${this.payrollUrl}/benefits/${id}`, benefit);
  }

  deleteEmployeeBenefit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.payrollUrl}/benefits/${id}`);
  }

  generateTimesheetsFromAttendance(data: any): Observable<any> {
    return this.http.post<any>(`${this.payrollUrl}/timesheets/generate-from-attendance`, data);
  }

  getProjectTimesheets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.payrollUrl}/project-timesheets`);
  }

  getProjectTimesheetsByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.payrollUrl}/project-timesheets/employee/${employeeId}`);
  }

  getProjectTimesheetsByProject(projectCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.payrollUrl}/project-timesheets/project/${projectCode}`);
  }

  createProjectTimesheet(timesheet: any): Observable<any> {
    return this.http.post<any>(`${this.payrollUrl}/project-timesheets`, timesheet);
  }

  approveProjectTimesheet(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.payrollUrl}/project-timesheets/${id}/approve`, data);
  }

  getApprovedAttendance(startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.payrollUrl}/attendance/approved?startDate=${startDate}&endDate=${endDate}`);
  }

  getAttendanceSummary(startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.payrollUrl}/attendance/summary?startDate=${startDate}&endDate=${endDate}`);
  }
}
