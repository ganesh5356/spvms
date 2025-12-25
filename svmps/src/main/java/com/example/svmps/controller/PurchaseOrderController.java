package com.example.svmps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.svmps.dto.PurchaseOrderDto;
import com.example.svmps.service.PurchaseOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/po")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;
    public PurchaseOrderController(PurchaseOrderService poService) { this.poService = poService; }

    @PostMapping("/from-pr/{prId}")
    public ResponseEntity<PurchaseOrderDto> createPoFromPr(@PathVariable Long prId, @Valid @RequestBody PurchaseOrderDto dto) {
        PurchaseOrderDto created = poService.createPoFromPr(prId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<PurchaseOrderDto> getAllPos() { return poService.getAllPos(); }

    @GetMapping("/{id}")
    public PurchaseOrderDto getPoById(@PathVariable Long id) { return poService.getPoById(id); }

    @PostMapping("/{id}/send")
    public PurchaseOrderDto sendPo(@PathVariable Long id) { return poService.updateStatus(id, "SENT"); }

    @PostMapping("/{id}/receive")
    public PurchaseOrderDto receivePo(@PathVariable Long id) { return poService.updateStatus(id, "RECEIVED"); }

    @PostMapping("/{id}/close")
    public PurchaseOrderDto closePo(@PathVariable Long id) { return poService.updateStatus(id, "CLOSED"); }
}
