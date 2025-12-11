export interface AuditTrail {
  id: number;
  entityType: string;
  entityId: number;
  entityName: string;
  action: AuditAction;
  performedBy: string;
  performedById: number;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
  ipAddress?: string;
  module: AuditModule;
}

export type AuditAction = 
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONVERTED_TO_PO'
  | 'STOCK_ISSUED'
  | 'STOCK_TRANSFERRED'
  | 'QUANTITY_MODIFIED'
  | 'ITEM_ADDED'
  | 'ITEM_REMOVED'
  | 'STATUS_CHANGED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'SETTINGS_UPDATED';

export type AuditModule = 
  | 'SYSTEM'
  | 'INVENTORY'
  | 'PURCHASE'
  | 'STOCK_MOVEMENT'
  | 'CUSTOMER'
  | 'CONTRACT'
  | 'SETTINGS';

export interface AuditFilter {
  module?: AuditModule;
  entityType?: string;
  action?: AuditAction;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}
