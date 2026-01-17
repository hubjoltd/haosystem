package com.erp.service;

import com.erp.model.AccountCategory;
import com.erp.model.ChartOfAccount;
import com.erp.repository.AccountCategoryRepository;
import com.erp.repository.ChartOfAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ChartOfAccountService {

    @Autowired
    private ChartOfAccountRepository accountRepository;

    @Autowired
    private AccountCategoryRepository categoryRepository;

    public List<ChartOfAccount> findAll() {
        return accountRepository.findAll();
    }

    public List<ChartOfAccount> findActiveAccounts() {
        return accountRepository.findByStatusOrderByAccountCode("Active");
    }

    public List<ChartOfAccount> findByAccountType(String accountType) {
        return accountRepository.findByAccountTypeOrderByAccountCode(accountType);
    }

    public List<ChartOfAccount> findPostableAccounts() {
        return accountRepository.findAllPostableAccounts();
    }

    public Optional<ChartOfAccount> findById(Long id) {
        return accountRepository.findById(id);
    }

    public Optional<ChartOfAccount> findByAccountCode(String accountCode) {
        return accountRepository.findByAccountCode(accountCode);
    }

    @Transactional
    public ChartOfAccount save(ChartOfAccount account) {
        return accountRepository.save(account);
    }

    @Transactional
    public void delete(Long id) {
        accountRepository.deleteById(id);
    }

    public List<AccountCategory> findAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrder();
    }

    public List<AccountCategory> findCategoriesByType(String accountType) {
        return categoryRepository.findByAccountTypeOrderByDisplayOrder(accountType);
    }

    @Transactional
    public AccountCategory saveCategory(AccountCategory category) {
        return categoryRepository.save(category);
    }

    public Map<String, BigDecimal> getAccountBalancesSummary() {
        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("assets", accountRepository.sumBalanceByAccountType("Asset"));
        summary.put("liabilities", accountRepository.sumBalanceByAccountType("Liability"));
        summary.put("equity", accountRepository.sumBalanceByAccountType("Equity"));
        summary.put("income", accountRepository.sumBalanceByAccountType("Income"));
        summary.put("expenses", accountRepository.sumBalanceByAccountType("Expense"));
        return summary;
    }

    @Transactional
    public void initializeDefaultChartOfAccounts() {
        if (accountRepository.count() > 0) {
            return;
        }

        List<AccountCategory> categories = createDefaultCategories();
        createDefaultAccounts(categories);
    }

    private List<AccountCategory> createDefaultCategories() {
        List<AccountCategory> categories = new ArrayList<>();
        
        categories.add(createCategory("Current Assets", "Asset", 1));
        categories.add(createCategory("Fixed Assets", "Asset", 2));
        categories.add(createCategory("Other Assets", "Asset", 3));
        categories.add(createCategory("Current Liabilities", "Liability", 4));
        categories.add(createCategory("Long-term Liabilities", "Liability", 5));
        categories.add(createCategory("Owner's Equity", "Equity", 6));
        categories.add(createCategory("Operating Revenue", "Income", 7));
        categories.add(createCategory("Other Revenue", "Income", 8));
        categories.add(createCategory("Cost of Goods Sold", "Expense", 9));
        categories.add(createCategory("Operating Expenses", "Expense", 10));
        categories.add(createCategory("Other Expenses", "Expense", 11));
        
        return categoryRepository.saveAll(categories);
    }

    private AccountCategory createCategory(String name, String type, int order) {
        AccountCategory cat = new AccountCategory();
        cat.setName(name);
        cat.setAccountType(type);
        cat.setDisplayOrder(order);
        cat.setIsSystem(true);
        cat.setCreatedBy("System");
        return cat;
    }

    private void createDefaultAccounts(List<AccountCategory> categories) {
        Map<String, AccountCategory> catMap = new HashMap<>();
        for (AccountCategory cat : categories) {
            catMap.put(cat.getName(), cat);
        }

        List<ChartOfAccount> accounts = new ArrayList<>();
        
        accounts.add(createAccount("1000", "Cash", "Asset", catMap.get("Current Assets"), "Debit"));
        accounts.add(createAccount("1010", "Petty Cash", "Asset", catMap.get("Current Assets"), "Debit"));
        accounts.add(createAccount("1100", "Accounts Receivable", "Asset", catMap.get("Current Assets"), "Debit"));
        accounts.add(createAccount("1200", "Inventory", "Asset", catMap.get("Current Assets"), "Debit"));
        accounts.add(createAccount("1300", "Prepaid Expenses", "Asset", catMap.get("Current Assets"), "Debit"));
        accounts.add(createAccount("1500", "Equipment", "Asset", catMap.get("Fixed Assets"), "Debit"));
        accounts.add(createAccount("1510", "Accumulated Depreciation - Equipment", "Asset", catMap.get("Fixed Assets"), "Credit"));
        accounts.add(createAccount("1600", "Vehicles", "Asset", catMap.get("Fixed Assets"), "Debit"));
        accounts.add(createAccount("1610", "Accumulated Depreciation - Vehicles", "Asset", catMap.get("Fixed Assets"), "Credit"));
        
        accounts.add(createAccount("2000", "Accounts Payable", "Liability", catMap.get("Current Liabilities"), "Credit"));
        accounts.add(createAccount("2100", "Credit Card Payable", "Liability", catMap.get("Current Liabilities"), "Credit"));
        accounts.add(createAccount("2200", "Accrued Liabilities", "Liability", catMap.get("Current Liabilities"), "Credit"));
        accounts.add(createAccount("2300", "Payroll Liabilities", "Liability", catMap.get("Current Liabilities"), "Credit"));
        accounts.add(createAccount("2400", "Sales Tax Payable", "Liability", catMap.get("Current Liabilities"), "Credit"));
        accounts.add(createAccount("2500", "Notes Payable", "Liability", catMap.get("Long-term Liabilities"), "Credit"));
        accounts.add(createAccount("2600", "Loans Payable", "Liability", catMap.get("Long-term Liabilities"), "Credit"));
        
        accounts.add(createAccount("3000", "Owner's Capital", "Equity", catMap.get("Owner's Equity"), "Credit"));
        accounts.add(createAccount("3100", "Owner's Draws", "Equity", catMap.get("Owner's Equity"), "Debit"));
        accounts.add(createAccount("3200", "Retained Earnings", "Equity", catMap.get("Owner's Equity"), "Credit"));
        
        accounts.add(createAccount("4000", "Sales Revenue", "Income", catMap.get("Operating Revenue"), "Credit"));
        accounts.add(createAccount("4100", "Service Revenue", "Income", catMap.get("Operating Revenue"), "Credit"));
        accounts.add(createAccount("4200", "Interest Income", "Income", catMap.get("Other Revenue"), "Credit"));
        accounts.add(createAccount("4300", "Other Income", "Income", catMap.get("Other Revenue"), "Credit"));
        
        accounts.add(createAccount("5000", "Cost of Goods Sold", "Expense", catMap.get("Cost of Goods Sold"), "Debit"));
        accounts.add(createAccount("5100", "Purchases", "Expense", catMap.get("Cost of Goods Sold"), "Debit"));
        accounts.add(createAccount("5200", "Purchase Returns", "Expense", catMap.get("Cost of Goods Sold"), "Credit"));
        accounts.add(createAccount("5300", "Freight-In", "Expense", catMap.get("Cost of Goods Sold"), "Debit"));
        
        accounts.add(createAccount("6000", "Salaries Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6100", "Wages Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6200", "Rent Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6300", "Utilities Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6400", "Insurance Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6500", "Office Supplies Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6600", "Depreciation Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6700", "Advertising Expense", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6800", "Repairs & Maintenance", "Expense", catMap.get("Operating Expenses"), "Debit"));
        accounts.add(createAccount("6900", "Bank Charges", "Expense", catMap.get("Other Expenses"), "Debit"));
        accounts.add(createAccount("6950", "Interest Expense", "Expense", catMap.get("Other Expenses"), "Debit"));
        
        accountRepository.saveAll(accounts);
    }

    private ChartOfAccount createAccount(String code, String name, String type, AccountCategory category, String balanceType) {
        ChartOfAccount account = new ChartOfAccount();
        account.setAccountCode(code);
        account.setAccountName(name);
        account.setAccountType(type);
        account.setCategory(category);
        account.setBalanceType(balanceType);
        account.setIsSystem(true);
        account.setStatus("Active");
        account.setCreatedBy("System");
        return account;
    }
}
