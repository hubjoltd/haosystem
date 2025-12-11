package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "goods_issue_lines")
public class GoodsIssueLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "goods_issue_id")
    private GoodsIssue goodsIssue;
    
    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;
    
    @ManyToOne
    @JoinColumn(name = "bin_id")
    private Bin bin;
    
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    
    public GoodsIssueLine() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public GoodsIssue getGoodsIssue() { return goodsIssue; }
    public void setGoodsIssue(GoodsIssue goodsIssue) { this.goodsIssue = goodsIssue; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public Bin getBin() { return bin; }
    public void setBin(Bin bin) { this.bin = bin; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
}
