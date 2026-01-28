export interface ExpenseCategory {
  id?: number;
  code: string;
  name: string;
  description?: string;
  parent?: ExpenseCategory;
  expenseType?: string;
  requiresReceipt?: boolean;
  maxAmount?: number;
  requiresApproval?: boolean;
  accountCode?: string;
  displayOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseItem {
  id?: number;
  expenseRequest?: ExpenseRequest;
  category?: ExpenseCategory;
  categoryId?: number;
  expenseType?: string;
  description: string;
  expenseDate?: string;
  vendor?: string;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  amountInBaseCurrency?: number;
  quantity?: number;
  unitPrice?: number;
  receiptNumber?: string;
  receiptUrl?: string;
  receiptAttached?: boolean;
  receiptFileName?: string;
  receiptFileData?: string;
  paymentMethod?: string;
  notes?: string;
  billable?: boolean;
  clientCode?: string;
  approved?: boolean;
  approvedAmount?: number;
  approvalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseRequest {
  id?: number;
  requestNumber?: string;
  employee?: any;
  employeeId?: number;
  title: string;
  description?: string;
  expenseDate?: string;
  periodFrom?: string;
  periodTo?: string;
  costCenter?: any;
  costCenterId?: number;
  projectCode?: string;
  categoryId?: number;
  payeeName?: string;
  totalAmount?: number;
  approvedAmount?: number;
  status?: string;
  approver?: any;
  approverId?: number;
  submittedAt?: string;
  approvedAt?: string;
  approverRemarks?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reimbursementRequired?: boolean;
  reimbursementStatus?: string;
  payrollRecord?: any;
  reimbursedAt?: string;
  postedToAccounts?: boolean;
  postedAt?: string;
  accountingReference?: string;
  items?: ExpenseItem[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  // 2-level approval fields
  managerApprovalStatus?: string;
  managerApprovedBy?: any;
  managerApprovedAt?: string;
  managerRemarks?: string;
  hrApprovalStatus?: string;
  hrApprovedBy?: any;
  hrApprovedAt?: string;
  hrRemarks?: string;
  activityLog?: ExpenseActivity[];
}

export interface ExpenseActivity {
  id?: number;
  action: string;
  performedBy?: any;
  performedAt?: string;
  remarks?: string;
  oldStatus?: string;
  newStatus?: string;
}

export const EXPENSE_TYPES = [
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'MEALS', label: 'Meals' },
  { value: 'PURCHASES', label: 'Purchases' },
  { value: 'OTHER', label: 'Other' }
];

export const EXPENSE_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'secondary' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'warning' },
  { value: 'APPROVED', label: 'Approved', color: 'success' },
  { value: 'REJECTED', label: 'Rejected', color: 'danger' },
  { value: 'RETURNED', label: 'Returned', color: 'info' }
];

export const REIMBURSEMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'warning' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'info' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'danger' }
];

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'CORPORATE_CARD', label: 'Corporate Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'OTHER', label: 'Other' }
];
