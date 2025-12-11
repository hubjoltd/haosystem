package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_transfer_lines")
public class StockTransferLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "stock_transfer_id")
    private StockTransfer stockTransfer;
    
    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;
    
    @ManyToOne
    @JoinColumn(name = "from_bin_id")
    private Bin fromBin;
    
    @ManyToOne
    @JoinColumn(name = "to_bin_id")
    private Bin toBin;
    
    private Integer quantity;
    
    public StockTransferLine() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StockTransfer getStockTransfer() { return stockTransfer; }
    public void setStockTransfer(StockTransfer stockTransfer) { this.stockTransfer = stockTransfer; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public Bin getFromBin() { return fromBin; }
    public void setFromBin(Bin fromBin) { this.fromBin = fromBin; }
    public Bin getToBin() { return toBin; }
    public void setToBin(Bin toBin) { this.toBin = toBin; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
