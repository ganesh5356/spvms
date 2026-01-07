package com.example.svmps.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PurchaseRequisitionDto {

    private Long id;

    @NotBlank(message = "PR number is required")
    private String prNumber;

    @NotNull(message = "Requester id is required")
    private Long requesterId;

    @NotNull(message = "Vendor id is required")
    private Long vendorId;

    private String status;

    /* ---- CLIENT SHOULD NOT SEND TOTAL ---- */
    private BigDecimal totalAmount;

    // Used only for approve/reject
    private String comments;

    /* ============ NEW FIELDS ============ */

    @NotNull(message = "Items are required")
    private List<String> items;

    @NotNull(message = "Quantities are required")
    private List<@Min(1) Integer> quantities;

    @NotNull(message = "Item amounts are required")
    private List<@NotNull @Min(1) BigDecimal> itemAmounts;

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

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
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
