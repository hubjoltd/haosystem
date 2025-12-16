import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { GeneralSettingsComponent } from './components/settings/general-settings/general-settings.component';
import { FinanceSettingsComponent } from './components/settings/finance-settings/finance-settings.component';
import { CustomerSettingsComponent } from './components/settings/customer-settings/customer-settings.component';
import { ContractSettingsComponent } from './components/settings/contract-settings/contract-settings.component';
import { RolesSettingsComponent } from './components/settings/roles-settings/roles-settings.component';
import { StaffManagementComponent } from './components/settings/staff-management/staff-management.component';
import { TaxRatesComponent } from './components/settings/finance-settings/tax-rates/tax-rates.component';
import { CurrenciesComponent } from './components/settings/finance-settings/currencies/currencies.component';
import { PaymentModesComponent } from './components/settings/finance-settings/payment-modes/payment-modes.component';
import { ExpenseCategoriesComponent } from './components/settings/finance-settings/expense-categories/expense-categories.component';

import { CustomerManagementComponent } from './components/customer-management/customer-management.component';
import { ContractManagementComponent } from './components/contract-management/contract-management.component';

import { GroupMasterComponent } from './components/inventory/group-master/group-master.component';
import { ItemMasterComponent } from './components/inventory/item-master/item-master.component';
import { UnitsOfMeasureComponent } from './components/inventory/units-of-measure/units-of-measure.component';
import { WarehouseBinComponent } from './components/inventory/warehouse-bin/warehouse-bin.component';
import { SupplierComponent } from './components/inventory/supplier/supplier.component';
import { InventoryValuationComponent } from './components/inventory/inventory-valuation/inventory-valuation.component';
import { InventoryLedgerComponent } from './components/inventory/inventory-ledger/inventory-ledger.component';

import { GoodsReceiptComponent } from './components/stock-movement/goods-receipt/goods-receipt.component';
import { GoodsIssueComponent } from './components/stock-movement/goods-issue/goods-issue.component';
import { StockTransferComponent } from './components/stock-movement/stock-transfer/stock-transfer.component';
import { StockAdjustmentsComponent } from './components/stock-movement/stock-adjustments/stock-adjustments.component';

import { StockSummaryReportComponent } from './components/reports/stock-summary-report/stock-summary-report.component';
import { InventoryValuationReportComponent } from './components/reports/inventory-valuation-report/inventory-valuation-report.component';
import { ItemMovementReportComponent } from './components/reports/item-movement-report/item-movement-report.component';
import { StockLedgerReportComponent } from './components/reports/stock-ledger-report/stock-ledger-report.component';
import { GroupWiseStockReportComponent } from './components/reports/group-wise-stock-report/group-wise-stock-report.component';
import { WarehouseStockReportComponent } from './components/reports/warehouse-stock-report/warehouse-stock-report.component';
import { ReorderLevelComponent } from './components/reports/reorder-level/reorder-level.component';
import { SlowMovingItemsReportComponent } from './components/reports/slow-moving-items-report/slow-moving-items-report.component';
import { PurchaseVsGrnReportComponent } from './components/reports/purchase-vs-grn-report/purchase-vs-grn-report.component';

import { PurchaseRequisitionComponent } from './components/purchase/purchase-requisition/purchase-requisition.component';
import { ConvertToPoComponent } from './components/purchase/pr-fulfillment/convert-to-po/convert-to-po.component';
import { StockIssueFulfillmentComponent } from './components/purchase/pr-fulfillment/stock-issue/stock-issue-fulfillment.component';
import { MaterialTransferFulfillmentComponent } from './components/purchase/pr-fulfillment/material-transfer/material-transfer-fulfillment.component';
import { DirectPurchaseComponent } from './components/purchase/direct-purchase/direct-purchase.component';

import { PrListReportComponent } from './components/reports/purchase/pr-list/pr-list-report.component';
import { PrPendingReportComponent } from './components/reports/purchase/pr-pending/pr-pending-report.component';
import { PrHistoryReportComponent } from './components/reports/purchase/pr-history/pr-history-report.component';
import { PoListReportComponent } from './components/reports/purchase/po-list/po-list-report.component';
import { DirectPurchaseReportComponent } from './components/reports/purchase/direct-purchase/direct-purchase-report.component';
import { StockIssueTransferReportComponent } from './components/reports/purchase/stock-issue-transfer/stock-issue-transfer-report.component';

import { SystemAuditsComponent } from './components/audit-trails/system-audits/system-audits.component';
import { InventoryAuditsComponent } from './components/audit-trails/inventory-audits/inventory-audits.component';
import { PurchaseAuditsComponent } from './components/audit-trails/purchase-audits/purchase-audits.component';

import { PrPrintComponent } from './components/purchase/pr-print/pr-print.component';
import { PoPrintComponent } from './components/purchase/po-print/po-print.component';
import { PurchaseInvoiceComponent } from './components/purchase/purchase-invoice/purchase-invoice.component';
import { PrefixSettingsComponent } from './components/settings/prefix-settings/prefix-settings.component';
import { AddRoleComponent } from './components/settings/roles-settings/add-role/add-role.component';
import { AddStaffComponent } from './components/settings/staff-management/add-staff/add-staff.component';

import { DepartmentsComponent } from './components/hr/organization/departments/departments.component';
import { LocationsComponent } from './components/hr/organization/locations/locations.component';
import { JobRolesComponent } from './components/hr/organization/job-roles/job-roles.component';
import { GradesComponent } from './components/hr/organization/grades/grades.component';
import { DesignationsComponent } from './components/hr/organization/designations/designations.component';
import { CostCentersComponent } from './components/hr/organization/cost-centers/cost-centers.component';
import { ExpenseCentersComponent } from './components/hr/organization/expense-centers/expense-centers.component';
import { EmployeeListComponent } from './components/hr/employees/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './components/hr/employees/employee-detail/employee-detail.component';
import { DocumentTypesComponent } from './components/hr/documents/document-types/document-types.component';
import { DocumentExpiryComponent } from './components/hr/documents/document-expiry/document-expiry.component';

import { HRDashboardComponent } from './components/mis-dashboards/hr-dashboard/hr-dashboard.component';
import { PayrollDashboardComponent } from './components/mis-dashboards/payroll-dashboard/payroll-dashboard.component';
import { AttendanceDashboardComponent } from './components/mis-dashboards/attendance-dashboard/attendance-dashboard.component';
import { PerformanceDashboardComponent } from './components/mis-dashboards/performance-dashboard/performance-dashboard.component';
import { CustomReportBuilderComponent } from './components/mis-dashboards/custom-report-builder/custom-report-builder.component';

import { ClockInOutComponent } from './components/attendance/clock-in-out/clock-in-out.component';
import { LeaveTypesComponent } from './components/leave/leave-types/leave-types.component';
import { LeaveRequestsComponent } from './components/leave/leave-requests/leave-requests.component';
import { HolidayCalendarComponent } from './components/leave/holiday-calendar/holiday-calendar.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'settings/general', component: GeneralSettingsComponent },
      { path: 'settings/finance', component: FinanceSettingsComponent },
      { path: 'settings/finance/tax-rates', component: TaxRatesComponent },
      { path: 'settings/finance/currencies', component: CurrenciesComponent },
      { path: 'settings/finance/payment-modes', component: PaymentModesComponent },
      { path: 'settings/finance/expense-categories', component: ExpenseCategoriesComponent },
      { path: 'settings/customer', component: CustomerSettingsComponent },
      { path: 'settings/contract', component: ContractSettingsComponent },
      { path: 'settings/roles', component: RolesSettingsComponent },
      { path: 'settings/roles/add', component: AddRoleComponent },
      { path: 'settings/roles/edit/:id', component: AddRoleComponent },
      { path: 'settings/staff', component: StaffManagementComponent },
      { path: 'settings/staff/add', component: AddStaffComponent },
      { path: 'settings/staff/edit/:id', component: AddStaffComponent },
      { path: 'settings/prefixes', component: PrefixSettingsComponent },
      { path: 'customers', component: CustomerManagementComponent },
      { path: 'contracts', component: ContractManagementComponent },
      { path: 'inventory/groups', component: GroupMasterComponent },
      { path: 'inventory/items', component: ItemMasterComponent },
      { path: 'inventory/units', component: UnitsOfMeasureComponent },
      { path: 'inventory/warehouse', component: WarehouseBinComponent },
      { path: 'inventory/suppliers', component: SupplierComponent },
      { path: 'inventory/valuation', component: InventoryValuationComponent },
      { path: 'inventory/ledger', component: InventoryLedgerComponent },
      { path: 'stock/grn', component: GoodsReceiptComponent },
      { path: 'stock/issue', component: GoodsIssueComponent },
      { path: 'stock/transfer', component: StockTransferComponent },
      { path: 'stock/adjustments', component: StockAdjustmentsComponent },
      { path: 'reports/stock-summary', component: StockSummaryReportComponent },
      { path: 'reports/valuation', component: InventoryValuationReportComponent },
      { path: 'reports/item-movement', component: ItemMovementReportComponent },
      { path: 'reports/stock-ledger', component: StockLedgerReportComponent },
      { path: 'reports/group-wise', component: GroupWiseStockReportComponent },
      { path: 'reports/warehouse-stock', component: WarehouseStockReportComponent },
      { path: 'reports/reorder-level', component: ReorderLevelComponent },
      { path: 'reports/slow-moving', component: SlowMovingItemsReportComponent },
      { path: 'reports/purchase-grn', component: PurchaseVsGrnReportComponent },
      { path: 'purchase/requisition', component: PurchaseRequisitionComponent },
      { path: 'purchase/fulfillment/convert-to-po', component: ConvertToPoComponent },
      { path: 'purchase/fulfillment/stock-issue', component: StockIssueFulfillmentComponent },
      { path: 'purchase/fulfillment/material-transfer', component: MaterialTransferFulfillmentComponent },
      { path: 'purchase/direct', component: DirectPurchaseComponent },
      { path: 'reports/purchase/pr-list', component: PrListReportComponent },
      { path: 'reports/purchase/pr-pending', component: PrPendingReportComponent },
      { path: 'reports/purchase/pr-history', component: PrHistoryReportComponent },
      { path: 'reports/purchase/po-list', component: PoListReportComponent },
      { path: 'reports/purchase/direct-purchase', component: DirectPurchaseReportComponent },
      { path: 'reports/purchase/stock-issue-transfer', component: StockIssueTransferReportComponent },
      { path: 'audit/system', component: SystemAuditsComponent },
      { path: 'audit/inventory', component: InventoryAuditsComponent },
      { path: 'audit/purchase', component: PurchaseAuditsComponent },
      { path: 'purchase/requisition/:id/print', component: PrPrintComponent },
      { path: 'purchase/direct/:id/print', component: PoPrintComponent },
      { path: 'purchase/invoices', component: PurchaseInvoiceComponent },
      { path: 'hr/organization/departments', component: DepartmentsComponent },
      { path: 'hr/organization/locations', component: LocationsComponent },
      { path: 'hr/organization/job-roles', component: JobRolesComponent },
      { path: 'hr/organization/grades', component: GradesComponent },
      { path: 'hr/organization/designations', component: DesignationsComponent },
      { path: 'hr/organization/cost-centers', component: CostCentersComponent },
      { path: 'hr/organization/expense-centers', component: ExpenseCentersComponent },
      { path: 'hr/employees', component: EmployeeListComponent },
      { path: 'hr/employees/:id', component: EmployeeDetailComponent },
      { path: 'hr/documents/types', component: DocumentTypesComponent },
      { path: 'hr/documents/reminders', component: DocumentExpiryComponent },
      { path: 'mis/hr-dashboard', component: HRDashboardComponent },
      { path: 'mis/payroll-dashboard', component: PayrollDashboardComponent },
      { path: 'mis/attendance-dashboard', component: AttendanceDashboardComponent },
      { path: 'mis/performance-dashboard', component: PerformanceDashboardComponent },
      { path: 'mis/report-builder', component: CustomReportBuilderComponent },
      { path: 'attendance/clock-in-out', component: ClockInOutComponent },
      { path: 'leave/types', component: LeaveTypesComponent },
      { path: 'leave/requests', component: LeaveRequestsComponent },
      { path: 'leave/holidays', component: HolidayCalendarComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
