package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "prefix_settings")
public class PrefixSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee Prefixes
    @Column(name = "employee_prefix")
    private String employeePrefix = "EMP-";
    
    @Column(name = "employee_next_number")
    private Integer employeeNextNumber = 1;

    // Inventory Prefixes
    @Column(name = "item_prefix")
    private String itemPrefix = "ITM-";
    
    @Column(name = "item_next_number")
    private Integer itemNextNumber = 1;
    
    @Column(name = "group_prefix")
    private String groupPrefix = "GRP-";
    
    @Column(name = "group_next_number")
    private Integer groupNextNumber = 1;
    
    @Column(name = "warehouse_prefix")
    private String warehousePrefix = "WH-";
    
    @Column(name = "warehouse_next_number")
    private Integer warehouseNextNumber = 1;
    
    @Column(name = "bin_prefix")
    private String binPrefix = "BIN-";
    
    @Column(name = "bin_next_number")
    private Integer binNextNumber = 1;
    
    @Column(name = "supplier_prefix")
    private String supplierPrefix = "SUP-";
    
    @Column(name = "supplier_next_number")
    private Integer supplierNextNumber = 1;
    
    @Column(name = "unit_prefix")
    private String unitPrefix = "UOM-";
    
    @Column(name = "unit_next_number")
    private Integer unitNextNumber = 1;

    // Purchase Prefixes
    @Column(name = "pr_prefix")
    private String prPrefix = "PR-";
    
    @Column(name = "pr_next_number")
    private Integer prNextNumber = 1;
    
    @Column(name = "po_prefix")
    private String poPrefix = "PO-";
    
    @Column(name = "po_next_number")
    private Integer poNextNumber = 1;
    
    @Column(name = "grn_prefix")
    private String grnPrefix = "GRN-";
    
    @Column(name = "grn_next_number")
    private Integer grnNextNumber = 1;

    // Stock Movement Prefixes
    @Column(name = "issue_prefix")
    private String issuePrefix = "GI-";
    
    @Column(name = "issue_next_number")
    private Integer issueNextNumber = 1;
    
    @Column(name = "transfer_prefix")
    private String transferPrefix = "ST-";
    
    @Column(name = "transfer_next_number")
    private Integer transferNextNumber = 1;
    
    @Column(name = "adjustment_prefix")
    private String adjustmentPrefix = "ADJ-";
    
    @Column(name = "adjustment_next_number")
    private Integer adjustmentNextNumber = 1;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmployeePrefix() { return employeePrefix; }
    public void setEmployeePrefix(String employeePrefix) { this.employeePrefix = employeePrefix; }
    public Integer getEmployeeNextNumber() { return employeeNextNumber; }
    public void setEmployeeNextNumber(Integer employeeNextNumber) { this.employeeNextNumber = employeeNextNumber; }

    public String getItemPrefix() { return itemPrefix; }
    public void setItemPrefix(String itemPrefix) { this.itemPrefix = itemPrefix; }
    public Integer getItemNextNumber() { return itemNextNumber; }
    public void setItemNextNumber(Integer itemNextNumber) { this.itemNextNumber = itemNextNumber; }

    public String getGroupPrefix() { return groupPrefix; }
    public void setGroupPrefix(String groupPrefix) { this.groupPrefix = groupPrefix; }
    public Integer getGroupNextNumber() { return groupNextNumber; }
    public void setGroupNextNumber(Integer groupNextNumber) { this.groupNextNumber = groupNextNumber; }

    public String getWarehousePrefix() { return warehousePrefix; }
    public void setWarehousePrefix(String warehousePrefix) { this.warehousePrefix = warehousePrefix; }
    public Integer getWarehouseNextNumber() { return warehouseNextNumber; }
    public void setWarehouseNextNumber(Integer warehouseNextNumber) { this.warehouseNextNumber = warehouseNextNumber; }

    public String getBinPrefix() { return binPrefix; }
    public void setBinPrefix(String binPrefix) { this.binPrefix = binPrefix; }
    public Integer getBinNextNumber() { return binNextNumber; }
    public void setBinNextNumber(Integer binNextNumber) { this.binNextNumber = binNextNumber; }

    public String getSupplierPrefix() { return supplierPrefix; }
    public void setSupplierPrefix(String supplierPrefix) { this.supplierPrefix = supplierPrefix; }
    public Integer getSupplierNextNumber() { return supplierNextNumber; }
    public void setSupplierNextNumber(Integer supplierNextNumber) { this.supplierNextNumber = supplierNextNumber; }

    public String getUnitPrefix() { return unitPrefix; }
    public void setUnitPrefix(String unitPrefix) { this.unitPrefix = unitPrefix; }
    public Integer getUnitNextNumber() { return unitNextNumber; }
    public void setUnitNextNumber(Integer unitNextNumber) { this.unitNextNumber = unitNextNumber; }

    public String getPrPrefix() { return prPrefix; }
    public void setPrPrefix(String prPrefix) { this.prPrefix = prPrefix; }
    public Integer getPrNextNumber() { return prNextNumber; }
    public void setPrNextNumber(Integer prNextNumber) { this.prNextNumber = prNextNumber; }

    public String getPoPrefix() { return poPrefix; }
    public void setPoPrefix(String poPrefix) { this.poPrefix = poPrefix; }
    public Integer getPoNextNumber() { return poNextNumber; }
    public void setPoNextNumber(Integer poNextNumber) { this.poNextNumber = poNextNumber; }

    public String getGrnPrefix() { return grnPrefix; }
    public void setGrnPrefix(String grnPrefix) { this.grnPrefix = grnPrefix; }
    public Integer getGrnNextNumber() { return grnNextNumber; }
    public void setGrnNextNumber(Integer grnNextNumber) { this.grnNextNumber = grnNextNumber; }

    public String getIssuePrefix() { return issuePrefix; }
    public void setIssuePrefix(String issuePrefix) { this.issuePrefix = issuePrefix; }
    public Integer getIssueNextNumber() { return issueNextNumber; }
    public void setIssueNextNumber(Integer issueNextNumber) { this.issueNextNumber = issueNextNumber; }

    public String getTransferPrefix() { return transferPrefix; }
    public void setTransferPrefix(String transferPrefix) { this.transferPrefix = transferPrefix; }
    public Integer getTransferNextNumber() { return transferNextNumber; }
    public void setTransferNextNumber(Integer transferNextNumber) { this.transferNextNumber = transferNextNumber; }

    public String getAdjustmentPrefix() { return adjustmentPrefix; }
    public void setAdjustmentPrefix(String adjustmentPrefix) { this.adjustmentPrefix = adjustmentPrefix; }
    public Integer getAdjustmentNextNumber() { return adjustmentNextNumber; }
    public void setAdjustmentNextNumber(Integer adjustmentNextNumber) { this.adjustmentNextNumber = adjustmentNextNumber; }
}
