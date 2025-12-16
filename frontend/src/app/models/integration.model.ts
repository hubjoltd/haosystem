export interface IntegrationConfig {
  id?: number;
  integrationType: string;
  name: string;
  description?: string;
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  username?: string;
  password?: string;
  companyId?: string;
  environment?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecurity?: string;
  smsProvider?: string;
  smsAccountSid?: string;
  smsAuthToken?: string;
  smsFromNumber?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  syncEnabled?: boolean;
  syncFrequency?: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  lastSyncMessage?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface IntegrationSyncLog {
  id?: number;
  integration?: IntegrationConfig;
  syncType: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  recordsProcessed?: number;
  recordsSuccessful?: number;
  recordsFailed?: number;
  errorDetails?: string;
  syncDetails?: string;
  triggeredBy?: string;
}

export interface IntegrationType {
  code: string;
  name: string;
  description: string;
  category: string;
}

export const INTEGRATION_TYPES: IntegrationType[] = [
  { code: 'QUICKBOOKS', name: 'QuickBooks', description: 'Accounting system integration', category: 'Accounting' },
  { code: 'SAP', name: 'SAP', description: 'Enterprise resource planning integration', category: 'Accounting' },
  { code: 'ADP', name: 'ADP', description: 'Payroll provider integration', category: 'Payroll' },
  { code: 'JIRA', name: 'Jira', description: 'Project management tool integration', category: 'Project' },
  { code: 'SMTP', name: 'SMTP', description: 'Email notification gateway', category: 'Notification' },
  { code: 'SMS', name: 'SMS', description: 'SMS notification gateway', category: 'Notification' }
];

export const SYNC_FREQUENCIES = [
  { value: 'HOURLY', label: 'Every Hour' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'MANUAL', label: 'Manual Only' }
];

export const ENVIRONMENTS = [
  { value: 'SANDBOX', label: 'Sandbox' },
  { value: 'PRODUCTION', label: 'Production' }
];
