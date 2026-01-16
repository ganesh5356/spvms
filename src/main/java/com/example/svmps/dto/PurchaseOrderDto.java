package com.example.svmps.dto;

import java.math.BigDecimal;

public class PurchaseOrderDto {

    private Long id;
    private Long prId;
    private String poNumber;
    private String status;

    private BigDecimal baseAmount;
    private BigDecimal cgstPercent;
    private BigDecimal sgstPercent;
    private BigDecimal igstPercent;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal totalGstAmount;
    private BigDecimal totalAmount;

    private Integer totalQuantity;
    private Integer deliveredQuantity;

    // 🔹 NEW FIELDS
    private Integer remainingQuantity;
    private BigDecimal balanceAmount;

    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPrId() {
        return prId;
    }

    public void setPrId(Long prId) {
        this.prId = prId;
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
    }

    public BigDecimal getCgstPercent() {
        return cgstPercent;
    }

    public void setCgstPercent(BigDecimal cgstPercent) {
        this.cgstPercent = cgstPercent;
    }

    public BigDecimal getSgstPercent() {
        return sgstPercent;
    }

    public void setSgstPercent(BigDecimal sgstPercent) {
        this.sgstPercent = sgstPercent;
    }

    public BigDecimal getIgstPercent() {
        return igstPercent;
    }

    public void setIgstPercent(BigDecimal igstPercent) {
        this.igstPercent = igstPercent;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public void setCgstAmount(BigDecimal cgstAmount) {
        this.cgstAmount = cgstAmount;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public void setSgstAmount(BigDecimal sgstAmount) {
        this.sgstAmount = sgstAmount;
    }

    public BigDecimal getIgstAmount() {
        return igstAmount;
    }

    public void setIgstAmount(BigDecimal igstAmount) {
        this.igstAmount = igstAmount;
    }

    public BigDecimal getTotalGstAmount() {
        return totalGstAmount;
    }

    public void setTotalGstAmount(BigDecimal totalGstAmount) {
        this.totalGstAmount = totalGstAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getDeliveredQuantity() {
        return deliveredQuantity;
    }

    public void setDeliveredQuantity(Integer deliveredQuantity) {
        this.deliveredQuantity = deliveredQuantity;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Integer remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public BigDecimal getBalanceAmount() {
        return balanceAmount;
    }

    public void setBalanceAmount(BigDecimal balanceAmount) {
        this.balanceAmount = balanceAmount;
    }
}
