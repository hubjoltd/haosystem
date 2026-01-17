package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budget_lines")
public class BudgetLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private ChartOfAccount account;

    @Column(name = "jan_amount", precision = 15, scale = 2)
    private BigDecimal janAmount = BigDecimal.ZERO;

    @Column(name = "feb_amount", precision = 15, scale = 2)
    private BigDecimal febAmount = BigDecimal.ZERO;

    @Column(name = "mar_amount", precision = 15, scale = 2)
    private BigDecimal marAmount = BigDecimal.ZERO;

    @Column(name = "apr_amount", precision = 15, scale = 2)
    private BigDecimal aprAmount = BigDecimal.ZERO;

    @Column(name = "may_amount", precision = 15, scale = 2)
    private BigDecimal mayAmount = BigDecimal.ZERO;

    @Column(name = "jun_amount", precision = 15, scale = 2)
    private BigDecimal junAmount = BigDecimal.ZERO;

    @Column(name = "jul_amount", precision = 15, scale = 2)
    private BigDecimal julAmount = BigDecimal.ZERO;

    @Column(name = "aug_amount", precision = 15, scale = 2)
    private BigDecimal augAmount = BigDecimal.ZERO;

    @Column(name = "sep_amount", precision = 15, scale = 2)
    private BigDecimal sepAmount = BigDecimal.ZERO;

    @Column(name = "oct_amount", precision = 15, scale = 2)
    private BigDecimal octAmount = BigDecimal.ZERO;

    @Column(name = "nov_amount", precision = 15, scale = 2)
    private BigDecimal novAmount = BigDecimal.ZERO;

    @Column(name = "dec_amount", precision = 15, scale = 2)
    private BigDecimal decAmount = BigDecimal.ZERO;

    @Column(name = "annual_amount", precision = 15, scale = 2)
    private BigDecimal annualAmount = BigDecimal.ZERO;

    private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Budget getBudget() { return budget; }
    public void setBudget(Budget budget) { this.budget = budget; }

    public ChartOfAccount getAccount() { return account; }
    public void setAccount(ChartOfAccount account) { this.account = account; }

    public BigDecimal getJanAmount() { return janAmount; }
    public void setJanAmount(BigDecimal janAmount) { this.janAmount = janAmount; }

    public BigDecimal getFebAmount() { return febAmount; }
    public void setFebAmount(BigDecimal febAmount) { this.febAmount = febAmount; }

    public BigDecimal getMarAmount() { return marAmount; }
    public void setMarAmount(BigDecimal marAmount) { this.marAmount = marAmount; }

    public BigDecimal getAprAmount() { return aprAmount; }
    public void setAprAmount(BigDecimal aprAmount) { this.aprAmount = aprAmount; }

    public BigDecimal getMayAmount() { return mayAmount; }
    public void setMayAmount(BigDecimal mayAmount) { this.mayAmount = mayAmount; }

    public BigDecimal getJunAmount() { return junAmount; }
    public void setJunAmount(BigDecimal junAmount) { this.junAmount = junAmount; }

    public BigDecimal getJulAmount() { return julAmount; }
    public void setJulAmount(BigDecimal julAmount) { this.julAmount = julAmount; }

    public BigDecimal getAugAmount() { return augAmount; }
    public void setAugAmount(BigDecimal augAmount) { this.augAmount = augAmount; }

    public BigDecimal getSepAmount() { return sepAmount; }
    public void setSepAmount(BigDecimal sepAmount) { this.sepAmount = sepAmount; }

    public BigDecimal getOctAmount() { return octAmount; }
    public void setOctAmount(BigDecimal octAmount) { this.octAmount = octAmount; }

    public BigDecimal getNovAmount() { return novAmount; }
    public void setNovAmount(BigDecimal novAmount) { this.novAmount = novAmount; }

    public BigDecimal getDecAmount() { return decAmount; }
    public void setDecAmount(BigDecimal decAmount) { this.decAmount = decAmount; }

    public BigDecimal getAnnualAmount() { return annualAmount; }
    public void setAnnualAmount(BigDecimal annualAmount) { this.annualAmount = annualAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
