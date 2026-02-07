export interface Project {
  id?: number;
  projectCode?: string;
  name: string;
  customerId?: number;
  customer?: any;
  billingType: 'FIXED_RATE' | 'PROJECT_HOURS' | 'TASK_HOURS';
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  completionDate?: string;
  estimatedHours?: number;
  estimatedCost?: number;
  description?: string;
  tags?: string[];
  
  members?: ProjectMember[];
  projectManagerId?: number;
  projectManager?: any;
  addedById?: number;
  addedBy?: any;
  dateCreated?: string;
  
  allowCustomerViewProject?: boolean;
  allowCustomerViewTasks?: boolean;
  allowCustomerCommentTasks?: boolean;
  allowCustomerViewTaskComments?: boolean;
  allowCustomerViewTimesheets?: boolean;
  allowCustomerViewFiles?: boolean;
  allowCustomerUploadFiles?: boolean;
  allowCustomerViewDiscussions?: boolean;
  
  fixedRateAmount?: number;
  hourlyRate?: number;
  currency?: string;
  billableTasks?: boolean;
  invoiceProject?: boolean;
  invoiceTasks?: boolean;
  invoiceTimesheets?: boolean;
  totalLoggedTime?: number;
  totalBillableTime?: number;
  
  calculatedProgress?: 'AUTO' | 'MANUAL';
  taskCompletionPercent?: number;
  projectCost?: number;
  projectExpenses?: number;
  
  locationTrackingEnabled?: boolean;
  locationLatitude?: number;
  locationLongitude?: number;
  locationRadiusMeters?: number;
  locationAddress?: string;

  lastActivity?: string;
  archived?: boolean;
  deleted?: boolean;
  
  tasks?: ProjectTask[];
  milestones?: ProjectMilestone[];
  files?: ProjectFile[];
  discussions?: ProjectDiscussion[];
  notes?: ProjectNote[];
  timeLogs?: ProjectTimeLog[];
  activities?: ProjectActivity[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id?: number;
  projectId?: number;
  employeeId?: number;
  employee?: any;
  role?: string;
  hourlyRate?: number;
  addedAt?: string;
}

export interface ProjectTask {
  id?: number;
  projectId?: number;
  milestoneId?: number;
  name: string;
  description?: string;
  assigneeId?: number;
  assignee?: any;
  status: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  billable?: boolean;
  visibleToClient?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMilestone {
  id?: number;
  projectId?: number;
  name: string;
  description?: string;
  dueDate?: string;
  status: string;
  order?: number;
  createdAt?: string;
}

export interface ProjectFile {
  id?: number;
  projectId?: number;
  name: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  visibility: 'STAFF' | 'CLIENT' | 'ALL';
  uploadedById?: number;
  uploadedBy?: any;
  uploadDate?: string;
}

export interface ProjectDiscussion {
  id?: number;
  projectId?: number;
  subject: string;
  content?: string;
  authorId?: number;
  author?: any;
  lastReplyAt?: string;
  repliesCount?: number;
  createdAt?: string;
}

export interface ProjectNote {
  id?: number;
  projectId?: number;
  content: string;
  authorId?: number;
  author?: any;
  createdAt?: string;
}

export interface ProjectTimeLog {
  id?: number;
  projectId?: number;
  taskId?: number;
  employeeId?: number;
  employee?: any;
  date: string;
  hours: number;
  description?: string;
  billable?: boolean;
  billed?: boolean;
  invoiceId?: number;
  createdAt?: string;
}

export interface ProjectActivity {
  id?: number;
  projectId?: number;
  userId?: number;
  user?: any;
  action: string;
  description: string;
  entityType?: string;
  entityId?: number;
  createdAt?: string;
}

export const PROJECT_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'secondary' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'primary' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'warning' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'danger' }
];

export const BILLING_TYPES = [
  { value: 'FIXED_RATE', label: 'Fixed Rate' },
  { value: 'PROJECT_HOURS', label: 'Project Hours' },
  { value: 'TASK_HOURS', label: 'Task Hours' }
];

export const TASK_STATUSES = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' }
];

export const TASK_PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'info' },
  { value: 'MEDIUM', label: 'Medium', color: 'warning' },
  { value: 'HIGH', label: 'High', color: 'danger' },
  { value: 'URGENT', label: 'Urgent', color: 'danger' }
];
