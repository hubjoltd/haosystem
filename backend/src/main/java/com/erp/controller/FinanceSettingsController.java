package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/accounting/settings")
public class FinanceSettingsController {

    @Autowired
    private ChartOfAccountRepository chartOfAccountRepository;

    @GetMapping("/general")
    public ResponseEntity<Map<String, Object>> getGeneralSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("fiscalYearStart", "January");
        settings.put("fiscalYearEnd", "December");
        settings.put("accountingMethod", "Accrual");
        settings.put("baseCurrency", "USD");
        settings.put("multiCurrencyEnabled", true);
        settings.put("autoJournalEntryNumbering", true);
        settings.put("requireApprovalForJournalEntries", false);
        settings.put("closingDateEnabled", false);
        settings.put("closingDate", null);
        settings.put("closingDatePassword", null);
        settings.put("trackBillableExpenses", true);
        settings.put("defaultPaymentTerms", "Net 30");
        settings.put("defaultBillPaymentTerms", "Net 30");
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/general")
    public ResponseEntity<Map<String, Object>> updateGeneralSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/account-detail-types")
    public ResponseEntity<List<Map<String, Object>>> getAccountDetailTypes() {
        List<Map<String, Object>> detailTypes = new ArrayList<>();
        
        String[][] types = {
            {"ASSET", "Bank", "Bank accounts for depositing and withdrawing funds"},
            {"ASSET", "Accounts Receivable", "Money owed to you by customers"},
            {"ASSET", "Other Current Asset", "Short-term assets expected to convert to cash within a year"},
            {"ASSET", "Fixed Asset", "Long-term tangible property or equipment"},
            {"ASSET", "Other Asset", "Assets that don't fall into other categories"},
            {"LIABILITY", "Accounts Payable", "Money you owe to vendors"},
            {"LIABILITY", "Credit Card", "Credit card accounts"},
            {"LIABILITY", "Other Current Liability", "Short-term obligations due within a year"},
            {"LIABILITY", "Long Term Liability", "Obligations due after one year"},
            {"EQUITY", "Owner's Equity", "The owner's investment in the business"},
            {"EQUITY", "Retained Earnings", "Cumulative earnings minus dividends"},
            {"INCOME", "Income", "Revenue from normal business operations"},
            {"INCOME", "Other Income", "Revenue from non-primary sources"},
            {"EXPENSE", "Expense", "Costs of normal business operations"},
            {"EXPENSE", "Other Expense", "Costs outside normal operations"},
            {"EXPENSE", "Cost of Goods Sold", "Direct costs of producing goods or services"}
        };
        
        long id = 1;
        for (String[] type : types) {
            Map<String, Object> detailType = new HashMap<>();
            detailType.put("id", id++);
            detailType.put("accountType", type[0]);
            detailType.put("name", type[1]);
            detailType.put("description", type[2]);
            detailType.put("isSystem", true);
            detailTypes.add(detailType);
        }
        
        return ResponseEntity.ok(detailTypes);
    }

    @PostMapping("/account-detail-types")
    public ResponseEntity<Map<String, Object>> createAccountDetailType(@RequestBody Map<String, Object> detailType) {
        detailType.put("id", System.currentTimeMillis());
        detailType.put("isSystem", false);
        return ResponseEntity.ok(detailType);
    }

    @GetMapping("/plaid")
    public ResponseEntity<Map<String, Object>> getPlaidSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("environment", "sandbox");
        settings.put("clientId", "");
        settings.put("secretConfigured", false);
        settings.put("productsEnabled", Arrays.asList("transactions", "auth", "balance"));
        settings.put("countryCodes", Arrays.asList("US", "CA"));
        settings.put("language", "en");
        settings.put("webhookUrl", "");
        settings.put("autoImportTransactions", false);
        settings.put("syncFrequency", "daily");
        settings.put("lastSyncDate", null);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/plaid")
    public ResponseEntity<Map<String, Object>> updatePlaidSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/income-statement")
    public ResponseEntity<Map<String, Object>> getIncomeStatementSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("showSubtotals", true);
        settings.put("showPercentages", true);
        settings.put("comparePeriods", true);
        settings.put("defaultDateRange", "This Fiscal Year");
        settings.put("accountingBasis", "Accrual");
        settings.put("showZeroBalanceAccounts", false);
        settings.put("consolidateAccounts", false);
        
        List<Map<String, Object>> sections = new ArrayList<>();
        
        Map<String, Object> incomeSection = new HashMap<>();
        incomeSection.put("name", "Income");
        incomeSection.put("order", 1);
        incomeSection.put("accountTypes", Arrays.asList("INCOME", "REVENUE"));
        incomeSection.put("showSubtotal", true);
        sections.add(incomeSection);
        
        Map<String, Object> cogsSection = new HashMap<>();
        cogsSection.put("name", "Cost of Goods Sold");
        cogsSection.put("order", 2);
        cogsSection.put("accountTypes", Arrays.asList("COGS"));
        cogsSection.put("showSubtotal", true);
        sections.add(cogsSection);
        
        Map<String, Object> expenseSection = new HashMap<>();
        expenseSection.put("name", "Expenses");
        expenseSection.put("order", 3);
        expenseSection.put("accountTypes", Arrays.asList("EXPENSE"));
        expenseSection.put("showSubtotal", true);
        sections.add(expenseSection);
        
        Map<String, Object> otherSection = new HashMap<>();
        otherSection.put("name", "Other Income/Expense");
        otherSection.put("order", 4);
        otherSection.put("accountTypes", Arrays.asList("OTHER_INCOME", "OTHER_EXPENSE"));
        otherSection.put("showSubtotal", true);
        sections.add(otherSection);
        
        settings.put("sections", sections);
        
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/income-statement")
    public ResponseEntity<Map<String, Object>> updateIncomeStatementSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/currency-rates")
    public ResponseEntity<List<Map<String, Object>>> getCurrencyRates() {
        List<Map<String, Object>> rates = new ArrayList<>();
        
        String[][] currencies = {
            {"EUR", "Euro", "0.92"},
            {"GBP", "British Pound", "0.79"},
            {"CAD", "Canadian Dollar", "1.36"},
            {"AUD", "Australian Dollar", "1.53"},
            {"JPY", "Japanese Yen", "149.50"},
            {"CHF", "Swiss Franc", "0.88"},
            {"CNY", "Chinese Yuan", "7.24"},
            {"INR", "Indian Rupee", "83.12"},
            {"MXN", "Mexican Peso", "17.15"},
            {"BRL", "Brazilian Real", "4.97"}
        };
        
        long id = 1;
        for (String[] currency : currencies) {
            Map<String, Object> rate = new HashMap<>();
            rate.put("id", id++);
            rate.put("currencyCode", currency[0]);
            rate.put("currencyName", currency[1]);
            rate.put("baseCurrency", "USD");
            rate.put("exchangeRate", new BigDecimal(currency[2]));
            rate.put("effectiveDate", LocalDate.now());
            rate.put("source", "Manual");
            rate.put("lastUpdated", LocalDateTime.now());
            rates.add(rate);
        }
        
        return ResponseEntity.ok(rates);
    }

    @PostMapping("/currency-rates")
    public ResponseEntity<Map<String, Object>> createCurrencyRate(@RequestBody Map<String, Object> rate) {
        rate.put("id", System.currentTimeMillis());
        rate.put("lastUpdated", LocalDateTime.now());
        return ResponseEntity.ok(rate);
    }

    @PutMapping("/currency-rates/{id}")
    public ResponseEntity<Map<String, Object>> updateCurrencyRate(@PathVariable Long id, @RequestBody Map<String, Object> rate) {
        rate.put("id", id);
        rate.put("lastUpdated", LocalDateTime.now());
        return ResponseEntity.ok(rate);
    }

    @DeleteMapping("/currency-rates/{id}")
    public ResponseEntity<Void> deleteCurrencyRate(@PathVariable Long id) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/currency-rates/fetch")
    public ResponseEntity<Map<String, Object>> fetchLatestRates() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Exchange rates updated successfully");
        result.put("lastUpdated", LocalDateTime.now());
        result.put("ratesUpdated", 10);
        return ResponseEntity.ok(result);
    }
}
