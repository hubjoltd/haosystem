import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
    PurchaseVsGrnReportComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
