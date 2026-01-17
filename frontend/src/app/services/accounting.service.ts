import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccountCategory {
  id?: number;
  name: string;
  accountType: string;
  description?: string;
  displayOrder?: number;
  isSystem?: boolean;
}

export interface ChartOfAccount {
  id?: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  category?: AccountCategory;
  parent?: ChartOfAccount;
  description?: string;
  isSubAccount?: boolean;
  isHeader?: boolean;
  isSystem?: boolean;
  openingBalance?: number;
  currentBalance?: number;
  balanceType?: string;
  status?: string;
  taxApplicable?: boolean;
}

export interface JournalLine {
  id?: number;
  account: ChartOfAccount;
  lineNumber?: number;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: number;
  projectId?: number;
  memo?: string;
}

export interface JournalEntry {
  id?: number;
  entryNumber?: string;
  entryDate: string;
  referenceType?: string;
  referenceId?: number;
  referenceNumber?: string;
  description: string;
  totalDebit?: number;
  totalCredit?: number;
  status?: string;
  isAdjusting?: boolean;
  isClosing?: boolean;
  isReversing?: boolean;
  lines: JournalLine[];
}

export interface BankAccount {
  id?: number;
  accountName: string;
  accountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bankAddress?: string;
  swiftCode?: string;
  iban?: string;
  routingNumber?: string;
  accountType?: string;
  currencyCode?: string;
  openingBalance?: number;
  currentBalance?: number;
  asOfDate?: string;
  glAccount?: ChartOfAccount;
  isPrimary?: boolean;
  isActive?: boolean;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  lastReconciledDate?: string;
  lastReconciledBalance?: number;
}

export interface BankTransaction {
  id?: number;
  bankAccount: BankAccount;
  transactionDate: string;
  valueDate?: string;
  transactionType: string;
  amount: number;
  runningBalance?: number;
  payee?: string;
  description?: string;
  reference?: string;
  checkNumber?: string;
  account?: ChartOfAccount;
  status?: string;
  matched?: boolean;
  isReconciled?: boolean;
  isTransfer?: boolean;
  isImported?: boolean;
  memo?: string;
}

export interface AccountTransfer {
  id?: number;
  transferNumber?: string;
  transferDate: string;
  fromAccount: BankAccount;
  toAccount: BankAccount;
  amount: number;
  description?: string;
  memo?: string;
  status?: string;
}

export interface BankingRule {
  id?: number;
  name: string;
  bankAccount?: BankAccount;
  applyToAllAccounts?: boolean;
  transactionType?: string;
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  assignAccount?: ChartOfAccount;
  assignPayee?: string;
  assignMemo?: string;
  autoConfirm?: boolean;
  isActive?: boolean;
  priority?: number;
}

export interface Bill {
  id?: number;
  billNumber?: string;
  supplier?: any;
  billDate: string;
  dueDate?: string;
  vendorInvoiceNumber?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  amountPaid?: number;
  balanceDue?: number;
  status?: string;
  terms?: string;
  memo?: string;
}

export interface Budget {
  id?: number;
  name: string;
  fiscalYear: number;
  budgetType?: string;
  description?: string;
  totalIncome?: number;
  totalExpense?: number;
  netAmount?: number;
  status?: string;
  isActive?: boolean;
}

export interface Reconciliation {
  id?: number;
  bankAccount: BankAccount;
  statementDate: string;
  statementEndingBalance?: number;
  beginningBalance?: number;
  clearedBalance?: number;
  difference?: number;
  isReconciled?: boolean;
  status?: string;
  notes?: string;
}

export interface AccountingDashboard {
  accountBalances: {
    assets: number;
    liabilities: number;
    equity: number;
    income: number;
    expenses: number;
  };
  profitLoss: number;
  banking: {
    totalBalance: number;
    activeAccounts: number;
    pendingTransactions: number;
  };
  outstandingPayables: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private baseUrl = '/api/accounting';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AccountingDashboard> {
    return this.http.get<AccountingDashboard>(`${this.baseUrl}/dashboard`);
  }

  getAllAccounts(): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(`${this.baseUrl}/accounts`);
  }

  getActiveAccounts(): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(`${this.baseUrl}/accounts/active`);
  }

  getPostableAccounts(): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(`${this.baseUrl}/accounts/postable`);
  }

  getAccountsByType(type: string): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(`${this.baseUrl}/accounts/type/${type}`);
  }

  getAccountById(id: number): Observable<ChartOfAccount> {
    return this.http.get<ChartOfAccount>(`${this.baseUrl}/accounts/${id}`);
  }

  createAccount(account: ChartOfAccount): Observable<ChartOfAccount> {
    return this.http.post<ChartOfAccount>(`${this.baseUrl}/accounts`, account);
  }

  updateAccount(id: number, account: ChartOfAccount): Observable<ChartOfAccount> {
    return this.http.put<ChartOfAccount>(`${this.baseUrl}/accounts/${id}`, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/accounts/${id}`);
  }

  getAllCategories(): Observable<AccountCategory[]> {
    return this.http.get<AccountCategory[]>(`${this.baseUrl}/categories`);
  }

  createCategory(category: AccountCategory): Observable<AccountCategory> {
    return this.http.post<AccountCategory>(`${this.baseUrl}/categories`, category);
  }

  initializeChartOfAccounts(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/initialize`, {});
  }

  getAllJournalEntries(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(`${this.baseUrl}/journal-entries`);
  }

  getJournalEntriesByStatus(status: string): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(`${this.baseUrl}/journal-entries/status/${status}`);
  }

  getJournalEntriesByDateRange(startDate: string, endDate: string): Observable<JournalEntry[]> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<JournalEntry[]>(`${this.baseUrl}/journal-entries/date-range`, { params });
  }

  getJournalEntryById(id: number): Observable<JournalEntry> {
    return this.http.get<JournalEntry>(`${this.baseUrl}/journal-entries/${id}`);
  }

  createJournalEntry(entry: JournalEntry): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(`${this.baseUrl}/journal-entries`, entry);
  }

  postJournalEntry(id: number): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(`${this.baseUrl}/journal-entries/${id}/post`, {});
  }

  reverseJournalEntry(id: number): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(`${this.baseUrl}/journal-entries/${id}/reverse`, {});
  }

  deleteJournalEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/journal-entries/${id}`);
  }

  getAccountLedger(accountId: number, startDate: string, endDate: string): Observable<JournalLine[]> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<JournalLine[]>(`${this.baseUrl}/ledger/${accountId}`, { params });
  }

  getAllBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.baseUrl}/bank-accounts`);
  }

  getActiveBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.baseUrl}/bank-accounts/active`);
  }

  getBankAccountById(id: number): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.baseUrl}/bank-accounts/${id}`);
  }

  createBankAccount(account: BankAccount): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${this.baseUrl}/bank-accounts`, account);
  }

  updateBankAccount(id: number, account: BankAccount): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.baseUrl}/bank-accounts/${id}`, account);
  }

  deleteBankAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bank-accounts/${id}`);
  }

  getBankTransactions(bankAccountId: number): Observable<BankTransaction[]> {
    return this.http.get<BankTransaction[]>(`${this.baseUrl}/bank-accounts/${bankAccountId}/transactions`);
  }

  getPendingTransactions(): Observable<BankTransaction[]> {
    return this.http.get<BankTransaction[]>(`${this.baseUrl}/transactions/pending`);
  }

  createTransaction(transaction: BankTransaction): Observable<BankTransaction> {
    return this.http.post<BankTransaction>(`${this.baseUrl}/transactions`, transaction);
  }

  confirmTransaction(id: number, accountId?: number): Observable<BankTransaction> {
    let params = new HttpParams();
    if (accountId) {
      params = params.set('accountId', accountId.toString());
    }
    return this.http.post<BankTransaction>(`${this.baseUrl}/transactions/${id}/confirm`, {}, { params });
  }

  createTransfer(transfer: AccountTransfer): Observable<AccountTransfer> {
    return this.http.post<AccountTransfer>(`${this.baseUrl}/transfers`, transfer);
  }

  getBankingRules(): Observable<BankingRule[]> {
    return this.http.get<BankingRule[]>(`${this.baseUrl}/banking-rules`);
  }

  createBankingRule(rule: BankingRule): Observable<BankingRule> {
    return this.http.post<BankingRule>(`${this.baseUrl}/banking-rules`, rule);
  }

  getAllBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.baseUrl}/bills`);
  }

  getUnpaidBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.baseUrl}/bills/unpaid`);
  }

  getAllBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.baseUrl}/budgets`);
  }

  getBudgetsByYear(year: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.baseUrl}/budgets/year/${year}`);
  }

  createBudget(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(`${this.baseUrl}/budgets`, budget);
  }

  getAllReconciliations(): Observable<Reconciliation[]> {
    return this.http.get<Reconciliation[]>(`${this.baseUrl}/reconciliations`);
  }

  getReconciliationsByBankAccount(bankAccountId: number): Observable<Reconciliation[]> {
    return this.http.get<Reconciliation[]>(`${this.baseUrl}/reconciliations/bank-account/${bankAccountId}`);
  }

  createReconciliation(reconciliation: Reconciliation): Observable<Reconciliation> {
    return this.http.post<Reconciliation>(`${this.baseUrl}/reconciliations`, reconciliation);
  }

  getTrialBalance(asOfDate: string): Observable<any> {
    const params = new HttpParams().set('asOfDate', asOfDate);
    return this.http.get<any>(`${this.baseUrl}/reports/trial-balance`, { params });
  }

  getIncomeStatement(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<any>(`${this.baseUrl}/reports/income-statement`, { params });
  }

  getBalanceSheet(asOfDate: string): Observable<any> {
    const params = new HttpParams().set('asOfDate', asOfDate);
    return this.http.get<any>(`${this.baseUrl}/reports/balance-sheet`, { params });
  }

  getDepositDetail(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any[]>(`${this.baseUrl}/reports/deposit-detail`, { params });
  }

  getIncomeByCustomer(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any[]>(`${this.baseUrl}/reports/income-by-customer`, { params });
  }

  getChequeDetail(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any[]>(`${this.baseUrl}/reports/cheque-detail`, { params });
  }

  getBudgetOverview(fiscalYear?: number): Observable<any[]> {
    let params = new HttpParams();
    if (fiscalYear) params = params.set('fiscalYear', fiscalYear.toString());
    return this.http.get<any[]>(`${this.baseUrl}/reports/budget-overview`, { params });
  }

  getBudgetVsActual(budgetId: number): Observable<any[]> {
    const params = new HttpParams().set('budgetId', budgetId.toString());
    return this.http.get<any[]>(`${this.baseUrl}/reports/budget-vs-actual`, { params });
  }

  getBudgetPerformance(budgetId: number): Observable<any> {
    const params = new HttpParams().set('budgetId', budgetId.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/budget-performance`, { params });
  }

  getARAgingSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/ar-aging-summary`);
  }

  getARAgingDetail(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/ar-aging-detail`);
  }

  getAPAgingSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/ap-aging-summary`);
  }

  getAPAgingDetail(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/ap-aging-detail`);
  }

  getGeneralSettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/general`);
  }

  updateGeneralSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/settings/general`, settings);
  }

  getAccountDetailTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/settings/account-detail-types`);
  }

  createAccountDetailType(detailType: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/settings/account-detail-types`, detailType);
  }

  getPlaidSettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/plaid`);
  }

  updatePlaidSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/settings/plaid`, settings);
  }

  getIncomeStatementSettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/income-statement`);
  }

  updateIncomeStatementSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/settings/income-statement`, settings);
  }

  getCurrencyRates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/settings/currency-rates`);
  }

  createCurrencyRate(rate: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/settings/currency-rates`, rate);
  }

  updateCurrencyRate(id: number, rate: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/settings/currency-rates/${id}`, rate);
  }

  deleteCurrencyRate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/settings/currency-rates/${id}`);
  }

  fetchLatestCurrencyRates(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/settings/currency-rates/fetch`, {});
  }
}
