package com.example.svmps.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.*;

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
    public PurchaseOrderDto createPo(
            @PathVariable Long prId,
            @RequestParam BigDecimal gstPercent) {

        return poService.createPo(prId, gstPercent);
    }

    // ================= DELIVER PO =================
    @PostMapping("/{poId}/deliver")
    public PurchaseOrderDto deliver(
            @PathVariable Long poId,
            @RequestParam Integer quantity) {

        return poService.updateDelivery(poId, quantity);
    }

    // ================= CLOSE PO =================
    @PostMapping("/{poId}/close")
    public PurchaseOrderDto close(@PathVariable Long poId) {

        return poService.closePo(poId);
    }

    // ================= GET PO BY ID =================
    @GetMapping("/{poId}")
    public PurchaseOrderDto getPoById(@PathVariable Long poId) {

        return poService.getPoById(poId);
    }

    // ================= GET ALL POs =================
    @GetMapping
    public List<PurchaseOrderDto> getAllPos() {

        return poService.getAllPos();
    }

    // ================= GET POs BY PR ID =================
    @GetMapping("/by-pr/{prId}")
    public List<PurchaseOrderDto> getPosByPrId(@PathVariable Long prId) {

        return poService.getPosByPrId(prId);
    }
}
