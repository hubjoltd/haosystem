import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth-interceptor.service';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
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
import { NotificationComponent } from './components/notification/notification.component';

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

import { RecruitmentComponent } from './components/hr/recruitment/recruitment.component';
import { RecruitmentRequisitionComponent } from './components/hr/recruitment/requisition/requisition.component';
import { RecruitmentPostingsComponent } from './components/hr/recruitment/postings/postings.component';
import { RecruitmentCandidatesComponent } from './components/hr/recruitment/candidates/candidates.component';
import { RecruitmentInterviewsComponent } from './components/hr/recruitment/interviews/interviews.component';
import { RecruitmentOffersComponent } from './components/hr/recruitment/offers/offers.component';
import { SettlementComponent } from './components/hr/settlement/settlement.component';

import { HRDashboardComponent } from './components/mis-dashboards/hr-dashboard/hr-dashboard.component';
import { PayrollDashboardComponent } from './components/mis-dashboards/payroll-dashboard/payroll-dashboard.component';
import { AttendanceDashboardComponent } from './components/mis-dashboards/attendance-dashboard/attendance-dashboard.component';
import { PerformanceDashboardComponent } from './components/mis-dashboards/performance-dashboard/performance-dashboard.component';
import { CustomReportBuilderComponent } from './components/mis-dashboards/custom-report-builder/custom-report-builder.component';

import { ClockInOutComponent } from './components/attendance/clock-in-out/clock-in-out.component';
import { LeaveTypesComponent } from './components/leave/leave-types/leave-types.component';
import { LeaveRequestsComponent } from './components/leave/leave-requests/leave-requests.component';
import { HolidayCalendarComponent } from './components/leave/holiday-calendar/holiday-calendar.component';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    LayoutComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    GeneralSettingsComponent,
    FinanceSettingsComponent,
    CustomerSettingsComponent,
    ContractSettingsComponent,
    RolesSettingsComponent,
    StaffManagementComponent,
    TaxRatesComponent,
    CurrenciesComponent,
    PaymentModesComponent,
    ExpenseCategoriesComponent,
    CustomerManagementComponent,
    ContractManagementComponent,
    GroupMasterComponent,
    ItemMasterComponent,
    UnitsOfMeasureComponent,
    WarehouseBinComponent,
    SupplierComponent,
    InventoryValuationComponent,
    InventoryLedgerComponent,
    GoodsReceiptComponent,
    GoodsIssueComponent,
    StockTransferComponent,
    StockAdjustmentsComponent,
    StockSummaryReportComponent,
    InventoryValuationReportComponent,
    ItemMovementReportComponent,
    StockLedgerReportComponent,
    GroupWiseStockReportComponent,
    WarehouseStockReportComponent,
    ReorderLevelComponent,
    SlowMovingItemsReportComponent,
    PurchaseVsGrnReportComponent,
    PurchaseRequisitionComponent,
    ConvertToPoComponent,
    StockIssueFulfillmentComponent,
    MaterialTransferFulfillmentComponent,
    DirectPurchaseComponent,
    PrListReportComponent,
    PrPendingReportComponent,
    PrHistoryReportComponent,
    PoListReportComponent,
    DirectPurchaseReportComponent,
    StockIssueTransferReportComponent,
    SystemAuditsComponent,
    InventoryAuditsComponent,
    PurchaseAuditsComponent,
    PrPrintComponent,
    PoPrintComponent,
    PurchaseInvoiceComponent,
    PrefixSettingsComponent,
    AddRoleComponent,
    AddStaffComponent,
    NotificationComponent,
    DepartmentsComponent,
    LocationsComponent,
    JobRolesComponent,
    GradesComponent,
    DesignationsComponent,
    CostCentersComponent,
    ExpenseCentersComponent,
    EmployeeListComponent,
    EmployeeDetailComponent,
    DocumentTypesComponent,
    DocumentExpiryComponent,
    RecruitmentComponent,
    RecruitmentRequisitionComponent,
    RecruitmentPostingsComponent,
    RecruitmentCandidatesComponent,
    RecruitmentInterviewsComponent,
    RecruitmentOffersComponent,
    SettlementComponent,
    HRDashboardComponent,
    PayrollDashboardComponent,
    AttendanceDashboardComponent,
    PerformanceDashboardComponent,
    CustomReportBuilderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    ClockInOutComponent,
    LeaveTypesComponent,
    LeaveRequestsComponent,
    HolidayCalendarComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
