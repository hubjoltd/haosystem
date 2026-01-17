package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class BankingService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private BankTransactionRepository transactionRepository;

    @Autowired
    private AccountTransferRepository transferRepository;

    @Autowired
    private BankingRuleRepository ruleRepository;

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private ChartOfAccountRepository accountRepository;

    public List<BankAccount> findAllBankAccounts() {
        return bankAccountRepository.findAll();
    }

    public List<BankAccount> findActiveBankAccounts() {
        return bankAccountRepository.findByIsActiveOrderByAccountName(true);
    }

    public Optional<BankAccount> findBankAccountById(Long id) {
        return bankAccountRepository.findById(id);
    }

    @Transactional
    public BankAccount saveBankAccount(BankAccount account) {
        return bankAccountRepository.save(account);
    }

    @Transactional
    public void deleteBankAccount(Long id) {
        bankAccountRepository.deleteById(id);
    }

    public List<BankTransaction> findTransactionsByBankAccount(Long bankAccountId) {
        return transactionRepository.findByBankAccountIdOrderByTransactionDateDesc(bankAccountId);
    }

    public List<BankTransaction> findTransactionsByDateRange(Long bankAccountId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByBankAccountIdAndTransactionDateBetweenOrderByTransactionDateDesc(bankAccountId, startDate, endDate);
    }

    public List<BankTransaction> findPendingTransactions() {
        return transactionRepository.findByStatusOrderByTransactionDateDesc("Pending");
    }

    @Transactional
    public BankTransaction createTransaction(BankTransaction transaction) {
        BankAccount bankAccount = transaction.getBankAccount();
        
        if ("Deposit".equals(transaction.getTransactionType())) {
            bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().add(transaction.getAmount()));
        } else if ("Withdrawal".equals(transaction.getTransactionType())) {
            bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().subtract(transaction.getAmount()));
        }
        
        transaction.setRunningBalance(bankAccount.getCurrentBalance());
        bankAccountRepository.save(bankAccount);
        
        applyBankingRules(transaction);
        
        return transactionRepository.save(transaction);
    }

    @Transactional
    public BankTransaction confirmTransaction(Long transactionId, Long accountId, String confirmedBy) {
        BankTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (accountId != null) {
            ChartOfAccount account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            transaction.setAccount(account);
        }

        JournalEntry journalEntry = createJournalEntryForTransaction(transaction, confirmedBy);
        transaction.setJournalEntry(journalEntry);
        transaction.setStatus("Confirmed");
        
        return transactionRepository.save(transaction);
    }

    private JournalEntry createJournalEntryForTransaction(BankTransaction transaction, String createdBy) {
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(transaction.getTransactionDate());
        entry.setDescription(transaction.getDescription());
        entry.setReferenceType("BankTransaction");
        entry.setReferenceId(transaction.getId());
        entry.setCreatedBy(createdBy);

        BankAccount bankAccount = transaction.getBankAccount();
        ChartOfAccount bankGlAccount = bankAccount.getGlAccount();
        ChartOfAccount categoryAccount = transaction.getAccount();

        JournalLine bankLine = new JournalLine();
        bankLine.setAccount(bankGlAccount);
        bankLine.setDescription(transaction.getDescription());
        
        JournalLine categoryLine = new JournalLine();
        categoryLine.setAccount(categoryAccount);
        categoryLine.setDescription(transaction.getDescription());

        if ("Deposit".equals(transaction.getTransactionType())) {
            bankLine.setDebitAmount(transaction.getAmount());
            bankLine.setCreditAmount(BigDecimal.ZERO);
            categoryLine.setDebitAmount(BigDecimal.ZERO);
            categoryLine.setCreditAmount(transaction.getAmount());
        } else {
            bankLine.setDebitAmount(BigDecimal.ZERO);
            bankLine.setCreditAmount(transaction.getAmount());
            categoryLine.setDebitAmount(transaction.getAmount());
            categoryLine.setCreditAmount(BigDecimal.ZERO);
        }

        entry.addLine(bankLine);
        entry.addLine(categoryLine);

        JournalEntry savedEntry = journalEntryService.createJournalEntry(entry);
        return journalEntryService.postJournalEntry(savedEntry.getId(), createdBy);
    }

    @Transactional
    public AccountTransfer createTransfer(AccountTransfer transfer, String createdBy) {
        transfer.setTransferNumber(generateTransferNumber());
        transfer.setCreatedBy(createdBy);

        BankAccount fromAccount = transfer.getFromAccount();
        BankAccount toAccount = transfer.getToAccount();

        fromAccount.setCurrentBalance(fromAccount.getCurrentBalance().subtract(transfer.getAmount()));
        toAccount.setCurrentBalance(toAccount.getCurrentBalance().add(transfer.getAmount()));

        bankAccountRepository.save(fromAccount);
        bankAccountRepository.save(toAccount);

        JournalEntry journalEntry = createJournalEntryForTransfer(transfer, createdBy);
        transfer.setJournalEntry(journalEntry);

        return transferRepository.save(transfer);
    }

    private JournalEntry createJournalEntryForTransfer(AccountTransfer transfer, String createdBy) {
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(transfer.getTransferDate());
        entry.setDescription("Transfer: " + transfer.getFromAccount().getAccountName() + " to " + transfer.getToAccount().getAccountName());
        entry.setReferenceType("AccountTransfer");
        entry.setReferenceId(transfer.getId());
        entry.setCreatedBy(createdBy);

        JournalLine fromLine = new JournalLine();
        fromLine.setAccount(transfer.getFromAccount().getGlAccount());
        fromLine.setDescription("Transfer out to " + transfer.getToAccount().getAccountName());
        fromLine.setDebitAmount(BigDecimal.ZERO);
        fromLine.setCreditAmount(transfer.getAmount());

        JournalLine toLine = new JournalLine();
        toLine.setAccount(transfer.getToAccount().getGlAccount());
        toLine.setDescription("Transfer in from " + transfer.getFromAccount().getAccountName());
        toLine.setDebitAmount(transfer.getAmount());
        toLine.setCreditAmount(BigDecimal.ZERO);

        entry.addLine(fromLine);
        entry.addLine(toLine);

        JournalEntry savedEntry = journalEntryService.createJournalEntry(entry);
        return journalEntryService.postJournalEntry(savedEntry.getId(), createdBy);
    }

    public List<BankingRule> findActiveRules() {
        return ruleRepository.findByIsActiveOrderByPriorityDesc(true);
    }

    @Transactional
    public BankingRule saveRule(BankingRule rule) {
        return ruleRepository.save(rule);
    }

    private void applyBankingRules(BankTransaction transaction) {
        List<BankingRule> rules = ruleRepository.findByIsActiveOrderByPriorityDesc(true);
        
        for (BankingRule rule : rules) {
            if (matchesRule(transaction, rule)) {
                if (rule.getAssignAccount() != null) {
                    transaction.setAccount(rule.getAssignAccount());
                }
                if (rule.getAssignPayee() != null) {
                    transaction.setPayee(rule.getAssignPayee());
                }
                if (rule.getAssignMemo() != null) {
                    transaction.setMemo(rule.getAssignMemo());
                }
                if (rule.getAutoConfirm()) {
                    transaction.setStatus("Confirmed");
                }
                rule.setTimesApplied(rule.getTimesApplied() + 1);
                ruleRepository.save(rule);
                break;
            }
        }
    }

    private boolean matchesRule(BankTransaction transaction, BankingRule rule) {
        if (rule.getTransactionType() != null && !rule.getTransactionType().equals(transaction.getTransactionType())) {
            return false;
        }

        if (!rule.getApplyToAllAccounts() && rule.getBankAccount() != null) {
            if (!rule.getBankAccount().getId().equals(transaction.getBankAccount().getId())) {
                return false;
            }
        }

        return matchesCondition(transaction, rule.getConditionField(), rule.getConditionOperator(), rule.getConditionValue());
    }

    private boolean matchesCondition(BankTransaction transaction, String field, String operator, String value) {
        if (field == null || operator == null || value == null) {
            return true;
        }

        String fieldValue = switch (field) {
            case "description" -> transaction.getDescription();
            case "payee" -> transaction.getPayee();
            case "reference" -> transaction.getReference();
            case "amount" -> transaction.getAmount().toString();
            default -> "";
        };

        if (fieldValue == null) {
            return false;
        }

        return switch (operator) {
            case "contains" -> fieldValue.toLowerCase().contains(value.toLowerCase());
            case "equals" -> fieldValue.equalsIgnoreCase(value);
            case "startsWith" -> fieldValue.toLowerCase().startsWith(value.toLowerCase());
            case "endsWith" -> fieldValue.toLowerCase().endsWith(value.toLowerCase());
            default -> false;
        };
    }

    private String generateTransferNumber() {
        Integer maxNum = transferRepository.findMaxTransferNumber();
        return String.format("TRF-%06d", (maxNum != null ? maxNum : 0) + 1);
    }

    public Map<String, Object> getBankingSummary() {
        Map<String, Object> summary = new HashMap<>();
        BigDecimal totalBalance = bankAccountRepository.sumTotalBalance();
        summary.put("totalBalance", totalBalance != null ? totalBalance : BigDecimal.ZERO);
        summary.put("activeAccounts", bankAccountRepository.findByIsActiveOrderByAccountName(true).size());
        summary.put("pendingTransactions", transactionRepository.findByStatusOrderByTransactionDateDesc("Pending").size());
        return summary;
    }
}
