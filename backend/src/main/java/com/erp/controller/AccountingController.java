package com.erp.controller;

import com.erp.model.*;
import com.erp.service.BankingService;
import com.erp.service.ChartOfAccountService;
import com.erp.service.JournalEntryService;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/accounting")
public class AccountingController {

    @Autowired
    private ChartOfAccountService chartOfAccountService;

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private BankingService bankingService;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ReconciliationRepository reconciliationRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        Map<String, BigDecimal> balances = chartOfAccountService.getAccountBalancesSummary();
        dashboard.put("accountBalances", balances);
        
        BigDecimal income = balances.get("income") != null ? balances.get("income") : BigDecimal.ZERO;
        BigDecimal expenses = balances.get("expenses") != null ? balances.get("expenses") : BigDecimal.ZERO;
        dashboard.put("profitLoss", income.subtract(expenses));
        
        dashboard.put("banking", bankingService.getBankingSummary());
        
        BigDecimal outstandingPayables = billRepository.sumOutstandingPayables();
        dashboard.put("outstandingPayables", outstandingPayables != null ? outstandingPayables : BigDecimal.ZERO);
        
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<ChartOfAccount>> getAllAccounts() {
        return ResponseEntity.ok(chartOfAccountService.findAll());
    }

    @GetMapping("/accounts/active")
    public ResponseEntity<List<ChartOfAccount>> getActiveAccounts() {
        return ResponseEntity.ok(chartOfAccountService.findActiveAccounts());
    }

    @GetMapping("/accounts/postable")
    public ResponseEntity<List<ChartOfAccount>> getPostableAccounts() {
        return ResponseEntity.ok(chartOfAccountService.findPostableAccounts());
    }

    @GetMapping("/accounts/type/{type}")
    public ResponseEntity<List<ChartOfAccount>> getAccountsByType(@PathVariable String type) {
        return ResponseEntity.ok(chartOfAccountService.findByAccountType(type));
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<ChartOfAccount> getAccountById(@PathVariable Long id) {
        return chartOfAccountService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/accounts")
    public ResponseEntity<ChartOfAccount> createAccount(@RequestBody ChartOfAccount account) {
        account.setCreatedBy("System");
        return ResponseEntity.ok(chartOfAccountService.save(account));
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<ChartOfAccount> updateAccount(@PathVariable Long id, @RequestBody ChartOfAccount account) {
        return chartOfAccountService.findById(id)
                .map(existing -> {
                    account.setId(id);
                    account.setModifiedBy("System");
                    return ResponseEntity.ok(chartOfAccountService.save(account));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        chartOfAccountService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<AccountCategory>> getAllCategories() {
        return ResponseEntity.ok(chartOfAccountService.findAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<AccountCategory> createCategory(@RequestBody AccountCategory category) {
        category.setCreatedBy("System");
        return ResponseEntity.ok(chartOfAccountService.saveCategory(category));
    }

    @PostMapping("/initialize")
    public ResponseEntity<Void> initializeChartOfAccounts() {
        chartOfAccountService.initializeDefaultChartOfAccounts();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/journal-entries")
    public ResponseEntity<List<JournalEntry>> getAllJournalEntries() {
        return ResponseEntity.ok(journalEntryService.findAll());
    }

    @GetMapping("/journal-entries/status/{status}")
    public ResponseEntity<List<JournalEntry>> getJournalEntriesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(journalEntryService.findByStatus(status));
    }

    @GetMapping("/journal-entries/date-range")
    public ResponseEntity<List<JournalEntry>> getJournalEntriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(journalEntryService.findByDateRange(startDate, endDate));
    }

    @GetMapping("/journal-entries/{id}")
    public ResponseEntity<JournalEntry> getJournalEntryById(@PathVariable Long id) {
        return journalEntryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/journal-entries")
    public ResponseEntity<JournalEntry> createJournalEntry(@RequestBody JournalEntry entry) {
        entry.setCreatedBy("System");
        return ResponseEntity.ok(journalEntryService.createJournalEntry(entry));
    }

    @PostMapping("/journal-entries/{id}/post")
    public ResponseEntity<JournalEntry> postJournalEntry(@PathVariable Long id) {
        return ResponseEntity.ok(journalEntryService.postJournalEntry(id, "System"));
    }

    @PostMapping("/journal-entries/{id}/reverse")
    public ResponseEntity<JournalEntry> reverseJournalEntry(@PathVariable Long id) {
        return ResponseEntity.ok(journalEntryService.reverseJournalEntry(id, "System"));
    }

    @DeleteMapping("/journal-entries/{id}")
    public ResponseEntity<Void> deleteJournalEntry(@PathVariable Long id) {
        journalEntryService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ledger/{accountId}")
    public ResponseEntity<List<JournalLine>> getAccountLedger(
            @PathVariable Long accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(journalEntryService.getAccountLedger(accountId, startDate, endDate));
    }

    @GetMapping("/bank-accounts")
    public ResponseEntity<List<BankAccount>> getAllBankAccounts() {
        return ResponseEntity.ok(bankingService.findAllBankAccounts());
    }

    @GetMapping("/bank-accounts/active")
    public ResponseEntity<List<BankAccount>> getActiveBankAccounts() {
        return ResponseEntity.ok(bankingService.findActiveBankAccounts());
    }

    @GetMapping("/bank-accounts/{id}")
    public ResponseEntity<BankAccount> getBankAccountById(@PathVariable Long id) {
        return bankingService.findBankAccountById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bank-accounts")
    public ResponseEntity<BankAccount> createBankAccount(@RequestBody BankAccount account) {
        account.setCreatedBy("System");
        return ResponseEntity.ok(bankingService.saveBankAccount(account));
    }

    @PutMapping("/bank-accounts/{id}")
    public ResponseEntity<BankAccount> updateBankAccount(@PathVariable Long id, @RequestBody BankAccount account) {
        return bankingService.findBankAccountById(id)
                .map(existing -> {
                    account.setId(id);
                    account.setModifiedBy("System");
                    return ResponseEntity.ok(bankingService.saveBankAccount(account));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/bank-accounts/{id}")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable Long id) {
        bankingService.deleteBankAccount(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bank-accounts/{bankAccountId}/transactions")
    public ResponseEntity<List<BankTransaction>> getBankTransactions(@PathVariable Long bankAccountId) {
        return ResponseEntity.ok(bankingService.findTransactionsByBankAccount(bankAccountId));
    }

    @GetMapping("/transactions/pending")
    public ResponseEntity<List<BankTransaction>> getPendingTransactions() {
        return ResponseEntity.ok(bankingService.findPendingTransactions());
    }

    @PostMapping("/transactions")
    public ResponseEntity<BankTransaction> createTransaction(@RequestBody BankTransaction transaction) {
        transaction.setCreatedBy("System");
        return ResponseEntity.ok(bankingService.createTransaction(transaction));
    }

    @PostMapping("/transactions/{id}/confirm")
    public ResponseEntity<BankTransaction> confirmTransaction(
            @PathVariable Long id,
            @RequestParam(required = false) Long accountId) {
        return ResponseEntity.ok(bankingService.confirmTransaction(id, accountId, "System"));
    }

    @PostMapping("/transfers")
    public ResponseEntity<AccountTransfer> createTransfer(@RequestBody AccountTransfer transfer) {
        return ResponseEntity.ok(bankingService.createTransfer(transfer, "System"));
    }

    @GetMapping("/banking-rules")
    public ResponseEntity<List<BankingRule>> getBankingRules() {
        return ResponseEntity.ok(bankingService.findActiveRules());
    }

    @PostMapping("/banking-rules")
    public ResponseEntity<BankingRule> createBankingRule(@RequestBody BankingRule rule) {
        rule.setCreatedBy("System");
        return ResponseEntity.ok(bankingService.saveRule(rule));
    }

    @GetMapping("/bills")
    public ResponseEntity<List<Bill>> getAllBills() {
        return ResponseEntity.ok(billRepository.findAll());
    }

    @GetMapping("/bills/unpaid")
    public ResponseEntity<List<Bill>> getUnpaidBills() {
        return ResponseEntity.ok(billRepository.findUnpaidBills());
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<Budget>> getAllBudgets() {
        return ResponseEntity.ok(budgetRepository.findAll());
    }

    @GetMapping("/budgets/year/{year}")
    public ResponseEntity<List<Budget>> getBudgetsByYear(@PathVariable Integer year) {
        return ResponseEntity.ok(budgetRepository.findByFiscalYearOrderByName(year));
    }

    @PostMapping("/budgets")
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        budget.setCreatedBy("System");
        return ResponseEntity.ok(budgetRepository.save(budget));
    }

    @GetMapping("/reconciliations")
    public ResponseEntity<List<Reconciliation>> getAllReconciliations() {
        return ResponseEntity.ok(reconciliationRepository.findAll());
    }

    @GetMapping("/reconciliations/bank-account/{bankAccountId}")
    public ResponseEntity<List<Reconciliation>> getReconciliationsByBankAccount(@PathVariable Long bankAccountId) {
        return ResponseEntity.ok(reconciliationRepository.findByBankAccountIdOrderByStatementDateDesc(bankAccountId));
    }

    @PostMapping("/reconciliations")
    public ResponseEntity<Reconciliation> createReconciliation(@RequestBody Reconciliation reconciliation) {
        reconciliation.setCreatedBy("System");
        return ResponseEntity.ok(reconciliationRepository.save(reconciliation));
    }
}
