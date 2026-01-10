package com.example.svmps.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.svmps.dto.PurchaseRequisitionDto;
import com.example.svmps.entity.ApprovalHistory;
import com.example.svmps.repository.ApprovalHistoryRepository;
import com.example.svmps.service.PurchaseRequisitionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pr")
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService prService;
    private final ApprovalHistoryRepository historyRepository;

    public PurchaseRequisitionController(
            PurchaseRequisitionService prService,
            ApprovalHistoryRepository historyRepository) {
        this.prService = prService;
        this.historyRepository = historyRepository;
    }

    // CREATE PR
    @PostMapping
    public PurchaseRequisitionDto createPr(
            @Valid @RequestBody PurchaseRequisitionDto dto) {
        return prService.createPr(dto);
    }

    // UPDATE PR (ONLY DRAFT)
    @PutMapping("/{id}")
    public PurchaseRequisitionDto updatePr(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseRequisitionDto dto) {
        return prService.updatePr(id, dto);
    }

    // SUBMIT
    @PostMapping("/{id}/submit")
    public PurchaseRequisitionDto submit(@PathVariable Long id) {
        return prService.submitPr(id);
    }

    // APPROVE
    @PostMapping("/{id}/approve")
    public PurchaseRequisitionDto approve(
            @PathVariable Long id,
            @RequestParam String comments,
            @RequestParam Long approverId) {
        return prService.approvePr(id, comments, approverId);
    }

    // REJECT
    @PostMapping("/{id}/reject")
    public PurchaseRequisitionDto reject(
            @PathVariable Long id,
            @RequestParam String comments,
            @RequestParam Long approverId) {
        return prService.rejectPr(id, comments, approverId);
    }

    // APPROVAL HISTORY BY PR
    @GetMapping("/{id}/history")
    public List<ApprovalHistory> history(@PathVariable Long id) {
        return historyRepository.findByPrId(id);
    }
    @GetMapping("/approval-history/all")
        public List<ApprovalHistory> getAllApprovalHistory() {
        return historyRepository.findAll();
    }


    // GET PR BY ID
    @GetMapping("/{id}")
    public PurchaseRequisitionDto fetchPrById(@PathVariable Long id) {
        return prService.getPrById(id);
    }

    // GET ALL PRs
    @GetMapping
    public List<PurchaseRequisitionDto> fetchAllPrs() {
        return prService.getAllPrs();
    }
}
