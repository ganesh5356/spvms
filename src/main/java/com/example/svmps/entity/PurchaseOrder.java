package com.example.svmps.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String poNumber;

    @Column(name = "pr_id", nullable = false)
    private Long prId;

    private String status; // CREATED, PARTIAL_DELIVERED, DELIVERED, CLOSED

    @Column(name = "base_amount")
    private BigDecimal baseAmount;

    @Column(name = "cgst_percent")
    @NotNull(message = "CGST percentage is required")
    @DecimalMin(value = "1.0", message = "CGST must be between 1 and 100")
    @DecimalMax(value = "100.0", message = "CGST must be between 1 and 100")
    private BigDecimal cgstPercent;

    @Column(name = "sgst_percent")
    @NotNull(message = "SGST percentage is required")
    @DecimalMin(value = "1.0", message = "SGST must be between 1 and 100")
    @DecimalMax(value = "100.0", message = "SGST must be between 1 and 100")
    private BigDecimal sgstPercent;

    @Column(name = "igst_percent")
    private BigDecimal igstPercent;

    @Column(name = "cgst_amount")
    private BigDecimal cgstAmount;

    @Column(name = "sgst_amount")
    private BigDecimal sgstAmount;

    @Column(name = "igst_amount")
    private BigDecimal igstAmount;

    @Column(name = "total_gst_amount")
    private BigDecimal totalGstAmount;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "items_json", length = 1000)
    private String itemsJson;

    @Column(name = "quantity_json", length = 1000)
    private String quantityJson;

    @Column(name = "delivered_quantity")
    private Integer deliveredQuantity;

    @Column(name = "total_quantity")
    private Integer totalQuantity;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        status = "CREATED";
        deliveredQuantity = 0;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public Long getPrId() { return prId; }
    public void setPrId(Long prId) { this.prId = prId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getBaseAmount() { return baseAmount; }
    public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }

    public BigDecimal getCgstPercent() { return cgstPercent; }
    public void setCgstPercent(BigDecimal cgstPercent) { this.cgstPercent = cgstPercent; }

    public BigDecimal getSgstPercent() { return sgstPercent; }
    public void setSgstPercent(BigDecimal sgstPercent) { this.sgstPercent = sgstPercent; }

    public BigDecimal getIgstPercent() { return igstPercent; }
    public void setIgstPercent(BigDecimal igstPercent) { this.igstPercent = igstPercent; }

    public BigDecimal getCgstAmount() { return cgstAmount; }
    public void setCgstAmount(BigDecimal cgstAmount) { this.cgstAmount = cgstAmount; }

    public BigDecimal getSgstAmount() { return sgstAmount; }
    public void setSgstAmount(BigDecimal sgstAmount) { this.sgstAmount = sgstAmount; }

    public BigDecimal getIgstAmount() { return igstAmount; }
    public void setIgstAmount(BigDecimal igstAmount) { this.igstAmount = igstAmount; }

    public BigDecimal getTotalGstAmount() { return totalGstAmount; }
    public void setTotalGstAmount(BigDecimal totalGstAmount) { this.totalGstAmount = totalGstAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public String getQuantityJson() { return quantityJson; }
    public void setQuantityJson(String quantityJson) { this.quantityJson = quantityJson; }

    public Integer getDeliveredQuantity() { return deliveredQuantity; }
    public void setDeliveredQuantity(Integer deliveredQuantity) { this.deliveredQuantity = deliveredQuantity; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
