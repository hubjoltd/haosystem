package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "branch_settings")
public class BranchSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "branch_id", nullable = false, unique = true)
    private Branch branch;
    
    private String companyLegalName;
    private String displayName;
    private String taxRegistrationNumber;
    private String businessRegistrationNumber;
    
    private Integer fiscalYearStartMonth = 1;
    private String timeFormat = "HH:mm";
    private String numberFormat = "#,##0.00";
    private String currencySymbol = "$";
    private String currencyPosition = "before";
    
    @Column(precision = 10, scale = 2)
    private BigDecimal defaultTaxRate = BigDecimal.ZERO;
    private String taxLabel = "Tax";
    
    private String invoicePrefix = "INV";
    private Long invoiceNextNumber = 1L;
    private String purchaseOrderPrefix = "PO";
    private Long purchaseOrderNextNumber = 1L;
    private String quotationPrefix = "QT";
    private Long quotationNextNumber = 1L;
    private String receiptPrefix = "RCP";
    private Long receiptNextNumber = 1L;
    private String payrollPrefix = "PR";
    private Long payrollNextNumber = 1L;
    
    private String defaultPaymentTerms = "Net 30";
    private Integer invoiceDueDays = 30;
    
    @Column(columnDefinition = "TEXT")
    private String invoiceFooter;
    
    @Column(columnDefinition = "TEXT")
    private String invoiceTerms;
    
    @Column(columnDefinition = "TEXT")
    private String letterhead;
    
    @Column(columnDefinition = "TEXT")
    private String signaturePath;
    
    private String primaryColor = "#008080";
    private String secondaryColor = "#006666";
    
    private Boolean showLogoOnInvoices = true;
    private Boolean showLogoOnReports = true;
    private Boolean autoGenerateEmployeeId = true;
    private String employeeIdPrefix = "EMP";
    private Long employeeIdNextNumber = 1L;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public BranchSettings() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public String getCompanyLegalName() { return companyLegalName; }
    public void setCompanyLegalName(String companyLegalName) { this.companyLegalName = companyLegalName; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getTaxRegistrationNumber() { return taxRegistrationNumber; }
    public void setTaxRegistrationNumber(String taxRegistrationNumber) { this.taxRegistrationNumber = taxRegistrationNumber; }
    public String getBusinessRegistrationNumber() { return businessRegistrationNumber; }
    public void setBusinessRegistrationNumber(String businessRegistrationNumber) { this.businessRegistrationNumber = businessRegistrationNumber; }
    public Integer getFiscalYearStartMonth() { return fiscalYearStartMonth; }
    public void setFiscalYearStartMonth(Integer fiscalYearStartMonth) { this.fiscalYearStartMonth = fiscalYearStartMonth; }
    public String getTimeFormat() { return timeFormat; }
    public void setTimeFormat(String timeFormat) { this.timeFormat = timeFormat; }
    public String getNumberFormat() { return numberFormat; }
    public void setNumberFormat(String numberFormat) { this.numberFormat = numberFormat; }
    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }
    public String getCurrencyPosition() { return currencyPosition; }
    public void setCurrencyPosition(String currencyPosition) { this.currencyPosition = currencyPosition; }
    public BigDecimal getDefaultTaxRate() { return defaultTaxRate; }
    public void setDefaultTaxRate(BigDecimal defaultTaxRate) { this.defaultTaxRate = defaultTaxRate; }
    public String getTaxLabel() { return taxLabel; }
    public void setTaxLabel(String taxLabel) { this.taxLabel = taxLabel; }
    public String getInvoicePrefix() { return invoicePrefix; }
    public void setInvoicePrefix(String invoicePrefix) { this.invoicePrefix = invoicePrefix; }
    public Long getInvoiceNextNumber() { return invoiceNextNumber; }
    public void setInvoiceNextNumber(Long invoiceNextNumber) { this.invoiceNextNumber = invoiceNextNumber; }
    public String getPurchaseOrderPrefix() { return purchaseOrderPrefix; }
    public void setPurchaseOrderPrefix(String purchaseOrderPrefix) { this.purchaseOrderPrefix = purchaseOrderPrefix; }
    public Long getPurchaseOrderNextNumber() { return purchaseOrderNextNumber; }
    public void setPurchaseOrderNextNumber(Long purchaseOrderNextNumber) { this.purchaseOrderNextNumber = purchaseOrderNextNumber; }
    public String getQuotationPrefix() { return quotationPrefix; }
    public void setQuotationPrefix(String quotationPrefix) { this.quotationPrefix = quotationPrefix; }
    public Long getQuotationNextNumber() { return quotationNextNumber; }
    public void setQuotationNextNumber(Long quotationNextNumber) { this.quotationNextNumber = quotationNextNumber; }
    public String getReceiptPrefix() { return receiptPrefix; }
    public void setReceiptPrefix(String receiptPrefix) { this.receiptPrefix = receiptPrefix; }
    public Long getReceiptNextNumber() { return receiptNextNumber; }
    public void setReceiptNextNumber(Long receiptNextNumber) { this.receiptNextNumber = receiptNextNumber; }
    public String getPayrollPrefix() { return payrollPrefix; }
    public void setPayrollPrefix(String payrollPrefix) { this.payrollPrefix = payrollPrefix; }
    public Long getPayrollNextNumber() { return payrollNextNumber; }
    public void setPayrollNextNumber(Long payrollNextNumber) { this.payrollNextNumber = payrollNextNumber; }
    public String getDefaultPaymentTerms() { return defaultPaymentTerms; }
    public void setDefaultPaymentTerms(String defaultPaymentTerms) { this.defaultPaymentTerms = defaultPaymentTerms; }
    public Integer getInvoiceDueDays() { return invoiceDueDays; }
    public void setInvoiceDueDays(Integer invoiceDueDays) { this.invoiceDueDays = invoiceDueDays; }
    public String getInvoiceFooter() { return invoiceFooter; }
    public void setInvoiceFooter(String invoiceFooter) { this.invoiceFooter = invoiceFooter; }
    public String getInvoiceTerms() { return invoiceTerms; }
    public void setInvoiceTerms(String invoiceTerms) { this.invoiceTerms = invoiceTerms; }
    public String getLetterhead() { return letterhead; }
    public void setLetterhead(String letterhead) { this.letterhead = letterhead; }
    public String getSignaturePath() { return signaturePath; }
    public void setSignaturePath(String signaturePath) { this.signaturePath = signaturePath; }
    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getSecondaryColor() { return secondaryColor; }
    public void setSecondaryColor(String secondaryColor) { this.secondaryColor = secondaryColor; }
    public Boolean getShowLogoOnInvoices() { return showLogoOnInvoices; }
    public void setShowLogoOnInvoices(Boolean showLogoOnInvoices) { this.showLogoOnInvoices = showLogoOnInvoices; }
    public Boolean getShowLogoOnReports() { return showLogoOnReports; }
    public void setShowLogoOnReports(Boolean showLogoOnReports) { this.showLogoOnReports = showLogoOnReports; }
    public Boolean getAutoGenerateEmployeeId() { return autoGenerateEmployeeId; }
    public void setAutoGenerateEmployeeId(Boolean autoGenerateEmployeeId) { this.autoGenerateEmployeeId = autoGenerateEmployeeId; }
    public String getEmployeeIdPrefix() { return employeeIdPrefix; }
    public void setEmployeeIdPrefix(String employeeIdPrefix) { this.employeeIdPrefix = employeeIdPrefix; }
    public Long getEmployeeIdNextNumber() { return employeeIdNextNumber; }
    public void setEmployeeIdNextNumber(Long employeeIdNextNumber) { this.employeeIdNextNumber = employeeIdNextNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
