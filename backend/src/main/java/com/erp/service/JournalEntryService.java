package com.erp.service;

import com.erp.model.ChartOfAccount;
import com.erp.model.JournalEntry;
import com.erp.model.JournalLine;
import com.erp.repository.ChartOfAccountRepository;
import com.erp.repository.JournalEntryRepository;
import com.erp.repository.JournalLineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class JournalEntryService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private JournalLineRepository journalLineRepository;

    @Autowired
    private ChartOfAccountRepository accountRepository;

    public List<JournalEntry> findAll() {
        return journalEntryRepository.findAll();
    }

    public List<JournalEntry> findByStatus(String status) {
        return journalEntryRepository.findByStatusOrderByEntryDateDesc(status);
    }

    public List<JournalEntry> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return journalEntryRepository.findByEntryDateBetweenOrderByEntryDateDesc(startDate, endDate);
    }

    public Optional<JournalEntry> findById(Long id) {
        return journalEntryRepository.findById(id);
    }

    public Optional<JournalEntry> findByEntryNumber(String entryNumber) {
        return journalEntryRepository.findByEntryNumber(entryNumber);
    }

    @Transactional
    public JournalEntry createJournalEntry(JournalEntry entry) {
        entry.setEntryNumber(generateEntryNumber());
        entry.setStatus("Draft");
        
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        
        int lineNum = 1;
        for (JournalLine line : entry.getLines()) {
            line.setJournalEntry(entry);
            line.setLineNumber(lineNum++);
            totalDebit = totalDebit.add(line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO);
            totalCredit = totalCredit.add(line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO);
        }
        
        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);
        
        return journalEntryRepository.save(entry);
    }

    @Transactional
    public JournalEntry save(JournalEntry entry) {
        return journalEntryRepository.save(entry);
    }

    @Transactional
    public JournalEntry postJournalEntry(Long id, String postedBy) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));

        if (!entry.getTotalDebit().equals(entry.getTotalCredit())) {
            throw new RuntimeException("Journal entry is not balanced. Debits must equal credits.");
        }

        for (JournalLine line : entry.getLines()) {
            ChartOfAccount account = line.getAccount();
            BigDecimal balanceChange;
            
            if ("Debit".equals(account.getBalanceType())) {
                balanceChange = line.getDebitAmount().subtract(line.getCreditAmount());
            } else {
                balanceChange = line.getCreditAmount().subtract(line.getDebitAmount());
            }
            
            account.setCurrentBalance(account.getCurrentBalance().add(balanceChange));
            accountRepository.save(account);
        }

        entry.setStatus("Posted");
        entry.setPostedBy(postedBy);
        entry.setPostedDate(java.time.LocalDateTime.now());
        
        return journalEntryRepository.save(entry);
    }

    @Transactional
    public JournalEntry reverseJournalEntry(Long id, String reversedBy) {
        JournalEntry original = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));

        if (!"Posted".equals(original.getStatus())) {
            throw new RuntimeException("Only posted entries can be reversed");
        }

        JournalEntry reversal = new JournalEntry();
        reversal.setEntryNumber(generateEntryNumber());
        reversal.setEntryDate(LocalDate.now());
        reversal.setDescription("Reversal of " + original.getEntryNumber());
        reversal.setIsReversing(true);
        reversal.setReversedEntryId(original.getId());
        reversal.setCreatedBy(reversedBy);

        for (JournalLine originalLine : original.getLines()) {
            JournalLine reversalLine = new JournalLine();
            reversalLine.setAccount(originalLine.getAccount());
            reversalLine.setDescription("Reversal: " + originalLine.getDescription());
            reversalLine.setDebitAmount(originalLine.getCreditAmount());
            reversalLine.setCreditAmount(originalLine.getDebitAmount());
            reversal.addLine(reversalLine);
        }

        reversal.setTotalDebit(original.getTotalCredit());
        reversal.setTotalCredit(original.getTotalDebit());
        
        JournalEntry savedReversal = journalEntryRepository.save(reversal);
        return postJournalEntry(savedReversal.getId(), reversedBy);
    }

    @Transactional
    public void delete(Long id) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));

        if ("Posted".equals(entry.getStatus())) {
            throw new RuntimeException("Cannot delete posted journal entries");
        }

        journalEntryRepository.delete(entry);
    }

    public List<JournalLine> getAccountLedger(Long accountId, LocalDate startDate, LocalDate endDate) {
        return journalLineRepository.findByAccountIdAndDateRange(accountId, startDate, endDate);
    }

    private String generateEntryNumber() {
        Integer maxNum = journalEntryRepository.findMaxEntryNumber();
        return String.format("JE-%06d", (maxNum != null ? maxNum : 0) + 1);
    }
}
