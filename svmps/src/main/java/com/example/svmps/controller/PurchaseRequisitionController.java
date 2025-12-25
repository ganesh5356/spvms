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

import com.example.svmps.dto.PurchaseRequisitionDto;
import com.example.svmps.service.PurchaseRequisitionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pr")
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService prService;
    public PurchaseRequisitionController(PurchaseRequisitionService prService) { this.prService = prService; }

    @PostMapping
    public ResponseEntity<PurchaseRequisitionDto> createPr(@Valid @RequestBody PurchaseRequisitionDto dto) {
        PurchaseRequisitionDto created = prService.createPr(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<PurchaseRequisitionDto> getAllPrs() { return prService.getAllPrs(); }

    @GetMapping("/{id}")
    public PurchaseRequisitionDto getPrById(@PathVariable Long id) { return prService.getPrById(id); }

    @PostMapping("/{id}/submit")
    public PurchaseRequisitionDto submitPr(@PathVariable Long id) { return prService.updateStatus(id, "SUBMITTED"); }

    @PostMapping("/{id}/approve")
    public PurchaseRequisitionDto approvePr(@PathVariable Long id) { return prService.updateStatus(id, "APPROVED"); }

    @PostMapping("/{id}/reject")
    public PurchaseRequisitionDto rejectPr(@PathVariable Long id) { return prService.updateStatus(id, "REJECTED"); }
}
