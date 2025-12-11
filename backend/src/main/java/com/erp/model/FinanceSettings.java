package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "finance_settings")
public class FinanceSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String taxId;
    private BigDecimal taxRate;
    private String invoicePrefix;
    private Integer nextInvoiceNumber;
    private String paymentTermsDefault;
    private String bankName;
    private String bankAccountNumber;
    private String bankRoutingNumber;
    private String fiscalYearStart;
    
    public FinanceSettings() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public String getInvoicePrefix() { return invoicePrefix; }
    public void setInvoicePrefix(String invoicePrefix) { this.invoicePrefix = invoicePrefix; }
    public Integer getNextInvoiceNumber() { return nextInvoiceNumber; }
    public void setNextInvoiceNumber(Integer nextInvoiceNumber) { this.nextInvoiceNumber = nextInvoiceNumber; }
    public String getPaymentTermsDefault() { return paymentTermsDefault; }
    public void setPaymentTermsDefault(String paymentTermsDefault) { this.paymentTermsDefault = paymentTermsDefault; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }
    public String getBankRoutingNumber() { return bankRoutingNumber; }
    public void setBankRoutingNumber(String bankRoutingNumber) { this.bankRoutingNumber = bankRoutingNumber; }
    public String getFiscalYearStart() { return fiscalYearStart; }
    public void setFiscalYearStart(String fiscalYearStart) { this.fiscalYearStart = fiscalYearStart; }
}
