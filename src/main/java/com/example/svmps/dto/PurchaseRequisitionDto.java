package com.example.svmps.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PurchaseRequisitionDto {

    private Long id;
    private String prNumber; // AUTO-GENERATED



    @NotNull
    private Long vendorId;

    private String requesterEmail;
    public String getRequesterEmail() { return requesterEmail; }
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }



    private String status;
    private BigDecimal totalAmount;

    private String comments;

    @NotNull
    private List<String> items;

    @NotNull
    private List<@Min(1) Integer> quantities;

    @NotNull
    private List<@Min(1) BigDecimal> itemAmounts;


    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPrNumber() {
        return prNumber;
    }

    public void setPrNumber(String prNumber) {
        this.prNumber = prNumber;
    }



    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public List<String> getItems() {
        return items;
    }

    public void setItems(List<String> items) {
        this.items = items;
    }

    public List<Integer> getQuantities() {
        return quantities;
    }

    public void setQuantities(List<Integer> quantities) {
        this.quantities = quantities;
    }

    public List<BigDecimal> getItemAmounts() {
        return itemAmounts;
    }

    public void setItemAmounts(List<BigDecimal> itemAmounts) {
        this.itemAmounts = itemAmounts;
    }
}
