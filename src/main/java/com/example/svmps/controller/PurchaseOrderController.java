package com.example.svmps.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.svmps.dto.PurchaseOrderDto;
import com.example.svmps.service.PurchaseOrderService;

@RestController
@RequestMapping("/api/po")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    public PurchaseOrderController(PurchaseOrderService poService) {
        this.poService = poService;
    }

    // ================= CREATE PO =================
    @PostMapping("/create/{prId}")
    @PreAuthorize("hasAnyRole('PROCUREMENT','ADMIN')")
    public PurchaseOrderDto createPo(
            @PathVariable Long prId,
            @RequestParam BigDecimal cgstPercent,
            @RequestParam BigDecimal sgstPercent,
            @RequestParam BigDecimal igstPercent) {

        return poService.createPo(prId, cgstPercent, sgstPercent, igstPercent);
    }

    // ================= DELIVER PO =================
    @PostMapping("/{poId}/deliver")
    @PreAuthorize("hasRole('VENDOR')")
    public PurchaseOrderDto deliver(
            @PathVariable Long poId,
            @RequestParam Integer quantity) {

        return poService.updateDelivery(poId, quantity);
    }

    // ================= CLOSE PO =================
    @PostMapping("/{poId}/close")
    @PreAuthorize("hasAnyRole('PROCUREMENT','ADMIN')")
    public PurchaseOrderDto close(@PathVariable Long poId) {
        return poService.closePo(poId);
    }

    // ================= GET PO BY ID =================
    @GetMapping("/{poId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE','VENDOR')")
    public PurchaseOrderDto getPoById(@PathVariable Long poId) {
        return poService.getPoById(poId);
    }

    // ================= GET ALL POs =================
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public List<PurchaseOrderDto> getAllPos() {
        return poService.getAllPos();
    }
    
    // ================= GET ALL POs WITH PAGINATION =================
    @GetMapping(params = {"page", "size"})
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public Page<PurchaseOrderDto> getAllPosWithPagination(Pageable pageable) {
        return poService.getAllPosWithPagination(pageable);
    }

    // ================= GET POs BY PR ID =================
    @GetMapping("/by-pr/{prId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public List<PurchaseOrderDto> getPosByPrId(@PathVariable Long prId) {
        return poService.getPosByPrId(prId);
    }

    // ================= GET POs BY VENDOR =================
    @GetMapping("/by-vendor/{vendorId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE','VENDOR')")
    public List<PurchaseOrderDto> getPosByVendorId(@PathVariable Long vendorId) {
        return poService.getPosByVendorId(vendorId);
    }

    // ================= DOWNLOAD INVOICE =================
    @GetMapping("/{poId}/invoice")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long poId) {

        PurchaseOrderDto po = poService.getPoById(poId);

        byte[] pdf = poService.generateInvoicePdf(po);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=Invoice_" + po.getPoNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
