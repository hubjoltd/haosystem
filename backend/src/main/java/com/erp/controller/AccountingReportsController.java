package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounting/reports")
public class AccountingReportsController {

    @Autowired
    private BankTransactionRepository bankTransactionRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private JournalLineRepository journalLineRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private BudgetLineRepository budgetLineRepository;

    @Autowired
    private ChartOfAccountRepository chartOfAccountRepository;

    @GetMapping("/deposit-detail")
    public ResponseEntity<List<Map<String, Object>>> getDepositDetail(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) startDate = LocalDate.now().withDayOfYear(1);
        if (endDate == null) endDate = LocalDate.now();

        List<Map<String, Object>> deposits = new ArrayList<>();
        List<BankTransaction> transactions = bankTransactionRepository.findByTransactionDateBetweenOrderByTransactionDateDesc(startDate, endDate);
        
        for (BankTransaction tx : transactions) {
            if ("DEPOSIT".equals(tx.getTransactionType()) || 
                (tx.getAmount() != null && tx.getAmount().compareTo(BigDecimal.ZERO) > 0)) {
                Map<String, Object> deposit = new HashMap<>();
                deposit.put("id", tx.getId());
                deposit.put("date", tx.getTransactionDate());
                deposit.put("reference", tx.getReference());
                deposit.put("description", tx.getDescription());
                deposit.put("customerSupplier", tx.getPayee());
                deposit.put("amount", tx.getAmount());
                deposit.put("bankAccount", tx.getBankAccount() != null ? tx.getBankAccount().getAccountName() : "");
                deposits.add(deposit);
            }
        }
        return ResponseEntity.ok(deposits);
    }

    @GetMapping("/income-by-customer")
    public ResponseEntity<List<Map<String, Object>>> getIncomeByCustomerSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) startDate = LocalDate.now().withDayOfYear(1);
        if (endDate == null) endDate = LocalDate.now();

        List<Map<String, Object>> summary = new ArrayList<>();
        List<Customer> customers = customerRepository.findAll();
        
        for (Customer customer : customers) {
            Map<String, Object> customerData = new HashMap<>();
            customerData.put("customerId", customer.getId());
            customerData.put("customerName", customer.getName());
            
            BigDecimal income = BigDecimal.ZERO;
            BigDecimal expenses = BigDecimal.ZERO;
            
            List<JournalLine> lines = journalLineRepository.findByCustomerIdAndDateRange(
                customer.getId(), startDate, endDate);
            
            for (JournalLine line : lines) {
                if (line.getAccount() != null) {
                    String accountType = line.getAccount().getAccountType();
                    if ("INCOME".equals(accountType) || "REVENUE".equals(accountType)) {
                        income = income.add(line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO);
                    } else if ("EXPENSE".equals(accountType)) {
                        expenses = expenses.add(line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO);
                    }
                }
            }
            
            customerData.put("income", income);
            customerData.put("expenses", expenses);
            customerData.put("netIncome", income.subtract(expenses));
            summary.add(customerData);
        }
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/cheque-detail")
    public ResponseEntity<List<Map<String, Object>>> getChequeDetail(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) startDate = LocalDate.now().withDayOfYear(1);
        if (endDate == null) endDate = LocalDate.now();

        List<Map<String, Object>> cheques = new ArrayList<>();
        List<BankTransaction> transactions = bankTransactionRepository.findByTransactionDateBetweenOrderByTransactionDateDesc(startDate, endDate);
        
        for (BankTransaction tx : transactions) {
            if ("CHEQUE".equals(tx.getTransactionType()) || "CHECK".equals(tx.getTransactionType()) ||
                (tx.getAmount() != null && tx.getAmount().compareTo(BigDecimal.ZERO) < 0)) {
                Map<String, Object> cheque = new HashMap<>();
                cheque.put("id", tx.getId());
                cheque.put("date", tx.getTransactionDate());
                cheque.put("chequeNumber", tx.getReference());
                cheque.put("payee", tx.getPayee());
                cheque.put("description", tx.getDescription());
                cheque.put("amount", tx.getAmount() != null ? tx.getAmount().abs() : BigDecimal.ZERO);
                cheque.put("bankAccount", tx.getBankAccount() != null ? tx.getBankAccount().getAccountName() : "");
                cheque.put("status", tx.getStatus());
                cheques.add(cheque);
            }
        }
        return ResponseEntity.ok(cheques);
    }

    @GetMapping("/budget-overview")
    public ResponseEntity<List<Map<String, Object>>> getBudgetOverview(
            @RequestParam(required = false) Integer fiscalYear) {
        
        if (fiscalYear == null) fiscalYear = LocalDate.now().getYear();

        List<Map<String, Object>> overview = new ArrayList<>();
        List<Budget> budgets = budgetRepository.findByFiscalYearOrderByName(fiscalYear);
        
        for (Budget budget : budgets) {
            Map<String, Object> budgetData = new HashMap<>();
            budgetData.put("budgetId", budget.getId());
            budgetData.put("budgetName", budget.getName());
            budgetData.put("fiscalYear", budget.getFiscalYear());
            budgetData.put("totalBudget", budget.getTotalAmount());
            budgetData.put("status", budget.getStatus());
            
            BigDecimal totalBudgeted = BigDecimal.ZERO;
            BigDecimal totalActual = BigDecimal.ZERO;
            
            List<BudgetLine> lines = budgetLineRepository.findByBudgetId(budget.getId());
            for (BudgetLine line : lines) {
                totalBudgeted = totalBudgeted.add(line.getBudgetedAmount() != null ? line.getBudgetedAmount() : BigDecimal.ZERO);
                totalActual = totalActual.add(line.getActualAmount() != null ? line.getActualAmount() : BigDecimal.ZERO);
            }
            
            budgetData.put("totalBudgeted", totalBudgeted);
            budgetData.put("totalActual", totalActual);
            budgetData.put("variance", totalBudgeted.subtract(totalActual));
            budgetData.put("variancePercent", totalBudgeted.compareTo(BigDecimal.ZERO) > 0 
                ? totalActual.divide(totalBudgeted, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO);
            
            overview.add(budgetData);
        }
        
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/budget-vs-actual")
    public ResponseEntity<List<Map<String, Object>>> getBudgetVsActual(
            @RequestParam Long budgetId) {
        
        List<Map<String, Object>> comparison = new ArrayList<>();
        List<BudgetLine> lines = budgetLineRepository.findByBudgetId(budgetId);
        
        for (BudgetLine line : lines) {
            Map<String, Object> lineData = new HashMap<>();
            lineData.put("accountId", line.getAccount() != null ? line.getAccount().getId() : null);
            lineData.put("accountCode", line.getAccount() != null ? line.getAccount().getAccountCode() : "");
            lineData.put("accountName", line.getAccount() != null ? line.getAccount().getAccountName() : "");
            lineData.put("accountType", line.getAccount() != null ? line.getAccount().getAccountType() : "");
            lineData.put("budgetedAmount", line.getBudgetedAmount());
            lineData.put("actualAmount", line.getActualAmount() != null ? line.getActualAmount() : BigDecimal.ZERO);
            
            BigDecimal budgeted = line.getBudgetedAmount() != null ? line.getBudgetedAmount() : BigDecimal.ZERO;
            BigDecimal actual = line.getActualAmount() != null ? line.getActualAmount() : BigDecimal.ZERO;
            
            lineData.put("variance", budgeted.subtract(actual));
            lineData.put("percentUsed", budgeted.compareTo(BigDecimal.ZERO) > 0 
                ? actual.divide(budgeted, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO);
            
            comparison.add(lineData);
        }
        
        return ResponseEntity.ok(comparison);
    }

    @GetMapping("/budget-performance")
    public ResponseEntity<Map<String, Object>> getBudgetPerformance(
            @RequestParam Long budgetId) {
        
        Map<String, Object> performance = new HashMap<>();
        Budget budget = budgetRepository.findById(budgetId).orElse(null);
        
        if (budget == null) {
            return ResponseEntity.notFound().build();
        }
        
        performance.put("budgetName", budget.getName());
        performance.put("fiscalYear", budget.getFiscalYear());
        
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        
        List<BudgetLine> lines = budgetLineRepository.findByBudgetId(budgetId);
        
        BigDecimal monthlyBudget = BigDecimal.ZERO;
        BigDecimal monthlyActual = BigDecimal.ZERO;
        BigDecimal ytdBudget = BigDecimal.ZERO;
        BigDecimal ytdActual = BigDecimal.ZERO;
        BigDecimal annualBudget = BigDecimal.ZERO;
        
        for (BudgetLine line : lines) {
            BigDecimal budgeted = line.getBudgetedAmount() != null ? line.getBudgetedAmount() : BigDecimal.ZERO;
            BigDecimal actual = line.getActualAmount() != null ? line.getActualAmount() : BigDecimal.ZERO;
            
            annualBudget = annualBudget.add(budgeted);
            ytdActual = ytdActual.add(actual);
            
            BigDecimal monthlyPortion = budgeted.divide(new BigDecimal("12"), 2, java.math.RoundingMode.HALF_UP);
            monthlyBudget = monthlyBudget.add(monthlyPortion);
            ytdBudget = ytdBudget.add(monthlyPortion.multiply(new BigDecimal(currentMonth)));
        }
        
        performance.put("currentMonth", currentMonth);
        performance.put("monthlyBudget", monthlyBudget);
        performance.put("monthlyActual", monthlyActual);
        performance.put("ytdBudget", ytdBudget);
        performance.put("ytdActual", ytdActual);
        performance.put("annualBudget", annualBudget);
        performance.put("ytdVariance", ytdBudget.subtract(ytdActual));
        performance.put("annualVariance", annualBudget.subtract(ytdActual));
        
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/ar-aging-summary")
    public ResponseEntity<List<Map<String, Object>>> getARAgingSummary() {
        List<Map<String, Object>> summary = new ArrayList<>();
        List<Customer> customers = customerRepository.findAll();
        LocalDate today = LocalDate.now();
        
        for (Customer customer : customers) {
            Map<String, Object> customerAging = new HashMap<>();
            customerAging.put("customerId", customer.getId());
            customerAging.put("customerName", customer.getName());
            
            BigDecimal current = BigDecimal.ZERO;
            BigDecimal days1to30 = BigDecimal.ZERO;
            BigDecimal days31to60 = BigDecimal.ZERO;
            BigDecimal days61to90 = BigDecimal.ZERO;
            BigDecimal over90 = BigDecimal.ZERO;
            
            List<JournalLine> receivables = journalLineRepository.findUnpaidReceivablesByCustomer(customer.getId());
            
            for (JournalLine line : receivables) {
                LocalDate dueDate = line.getJournalEntry() != null ? line.getJournalEntry().getEntryDate() : today;
                long daysPastDue = ChronoUnit.DAYS.between(dueDate, today);
                BigDecimal amount = line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO;
                
                if (daysPastDue <= 0) {
                    current = current.add(amount);
                } else if (daysPastDue <= 30) {
                    days1to30 = days1to30.add(amount);
                } else if (daysPastDue <= 60) {
                    days31to60 = days31to60.add(amount);
                } else if (daysPastDue <= 90) {
                    days61to90 = days61to90.add(amount);
                } else {
                    over90 = over90.add(amount);
                }
            }
            
            BigDecimal total = current.add(days1to30).add(days31to60).add(days61to90).add(over90);
            if (total.compareTo(BigDecimal.ZERO) > 0) {
                customerAging.put("current", current);
                customerAging.put("days1to30", days1to30);
                customerAging.put("days31to60", days31to60);
                customerAging.put("days61to90", days61to90);
                customerAging.put("over90", over90);
                customerAging.put("total", total);
                summary.add(customerAging);
            }
        }
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/ar-aging-detail")
    public ResponseEntity<List<Map<String, Object>>> getARAgingDetail() {
        List<Map<String, Object>> details = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        List<JournalLine> receivables = journalLineRepository.findAllUnpaidReceivables();
        
        for (JournalLine line : receivables) {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", line.getId());
            detail.put("invoiceNumber", line.getJournalEntry() != null ? line.getJournalEntry().getEntryNumber() : "");
            detail.put("invoiceDate", line.getJournalEntry() != null ? line.getJournalEntry().getEntryDate() : null);
            detail.put("customerId", line.getCustomerId());
            detail.put("description", line.getDescription());
            detail.put("amount", line.getDebitAmount());
            
            LocalDate dueDate = line.getJournalEntry() != null ? line.getJournalEntry().getEntryDate() : today;
            long daysPastDue = ChronoUnit.DAYS.between(dueDate, today);
            detail.put("daysPastDue", daysPastDue);
            
            String agingBucket;
            if (daysPastDue <= 0) agingBucket = "Current";
            else if (daysPastDue <= 30) agingBucket = "1-30 Days";
            else if (daysPastDue <= 60) agingBucket = "31-60 Days";
            else if (daysPastDue <= 90) agingBucket = "61-90 Days";
            else agingBucket = "Over 90 Days";
            
            detail.put("agingBucket", agingBucket);
            details.add(detail);
        }
        
        return ResponseEntity.ok(details);
    }

    @GetMapping("/ap-aging-summary")
    public ResponseEntity<List<Map<String, Object>>> getAPAgingSummary() {
        List<Map<String, Object>> summary = new ArrayList<>();
        List<Supplier> suppliers = supplierRepository.findAll();
        LocalDate today = LocalDate.now();
        
        for (Supplier supplier : suppliers) {
            Map<String, Object> supplierAging = new HashMap<>();
            supplierAging.put("supplierId", supplier.getId());
            supplierAging.put("supplierName", supplier.getName());
            
            BigDecimal current = BigDecimal.ZERO;
            BigDecimal days1to30 = BigDecimal.ZERO;
            BigDecimal days31to60 = BigDecimal.ZERO;
            BigDecimal days61to90 = BigDecimal.ZERO;
            BigDecimal over90 = BigDecimal.ZERO;
            
            List<Bill> bills = billRepository.findUnpaidBillsBySupplierId(supplier.getId());
            
            for (Bill bill : bills) {
                LocalDate dueDate = bill.getDueDate() != null ? bill.getDueDate() : bill.getBillDate();
                long daysPastDue = ChronoUnit.DAYS.between(dueDate, today);
                BigDecimal amount = bill.getBalanceDue() != null ? bill.getBalanceDue() : BigDecimal.ZERO;
                
                if (daysPastDue <= 0) {
                    current = current.add(amount);
                } else if (daysPastDue <= 30) {
                    days1to30 = days1to30.add(amount);
                } else if (daysPastDue <= 60) {
                    days31to60 = days31to60.add(amount);
                } else if (daysPastDue <= 90) {
                    days61to90 = days61to90.add(amount);
                } else {
                    over90 = over90.add(amount);
                }
            }
            
            BigDecimal total = current.add(days1to30).add(days31to60).add(days61to90).add(over90);
            if (total.compareTo(BigDecimal.ZERO) > 0) {
                supplierAging.put("current", current);
                supplierAging.put("days1to30", days1to30);
                supplierAging.put("days31to60", days31to60);
                supplierAging.put("days61to90", days61to90);
                supplierAging.put("over90", over90);
                supplierAging.put("total", total);
                summary.add(supplierAging);
            }
        }
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/ap-aging-detail")
    public ResponseEntity<List<Map<String, Object>>> getAPAgingDetail() {
        List<Map<String, Object>> details = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        List<Bill> bills = billRepository.findUnpaidBills();
        
        for (Bill bill : bills) {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", bill.getId());
            detail.put("billNumber", bill.getBillNumber());
            detail.put("billDate", bill.getBillDate());
            detail.put("dueDate", bill.getDueDate());
            detail.put("supplierId", bill.getSupplier() != null ? bill.getSupplier().getId() : null);
            detail.put("supplierName", bill.getSupplier() != null ? bill.getSupplier().getName() : "");
            detail.put("description", bill.getDescription());
            detail.put("totalAmount", bill.getTotalAmount());
            detail.put("amountPaid", bill.getAmountPaid());
            detail.put("balanceDue", bill.getBalanceDue());
            
            LocalDate dueDate = bill.getDueDate() != null ? bill.getDueDate() : bill.getBillDate();
            long daysPastDue = ChronoUnit.DAYS.between(dueDate, today);
            detail.put("daysPastDue", Math.max(0, daysPastDue));
            
            String agingBucket;
            if (daysPastDue <= 0) agingBucket = "Current";
            else if (daysPastDue <= 30) agingBucket = "1-30 Days";
            else if (daysPastDue <= 60) agingBucket = "31-60 Days";
            else if (daysPastDue <= 90) agingBucket = "61-90 Days";
            else agingBucket = "Over 90 Days";
            
            detail.put("agingBucket", agingBucket);
            details.add(detail);
        }
        
        return ResponseEntity.ok(details);
    }
}
