package com.example.svmps.controller;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    // CREATE PR → ADMIN, PROCUREMENT
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public PurchaseRequisitionDto createPr(
            @Valid @RequestBody PurchaseRequisitionDto dto) {
        return prService.createPr(dto);
    }

    // UPDATE PR (DRAFT) → ADMIN, PROCUREMENT
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public PurchaseRequisitionDto updatePr(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseRequisitionDto dto) {
        return prService.updatePr(id, dto);
    }

    // SUBMIT PR → ADMIN, PROCUREMENT
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public PurchaseRequisitionDto submit(@PathVariable Long id) {
        return prService.submitPr(id);
    }

    // APPROVE PR → FINANCE and ADMIN ONLY
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public PurchaseRequisitionDto approve(
            @PathVariable Long id,
            @RequestParam String comments,
            @RequestParam Long approverId) {
        return prService.approvePr(id, comments, approverId);
    }

    // REJECT PR → Admin ONLY
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public PurchaseRequisitionDto reject(
            @PathVariable Long id,
            @RequestParam String comments,
            @RequestParam Long approverId) {
        return prService.rejectPr(id, comments, approverId);
    }

    // APPROVAL HISTORY → ADMIN, PROCUREMENT, FINANCE
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public List<ApprovalHistory> history(@PathVariable Long id) {
        return historyRepository.findByPrId(id);
    }

    @GetMapping("/approval-history/all")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public List<ApprovalHistory> getAllApprovalHistory() {
        return historyRepository.findAll();
    }

    // GET PR BY ID → ADMIN, PROCUREMENT, FINANCE
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public PurchaseRequisitionDto fetchPrById(@PathVariable Long id) {
        return prService.getPrById(id);
    }

    // GET ALL PRs → ADMIN, PROCUREMENT, FINANCE
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public List<PurchaseRequisitionDto> fetchAllPrs() {
        return prService.getAllPrs();
    }
    
    // GET ALL PRs WITH PAGINATION → ADMIN, PROCUREMENT, FINANCE
    @GetMapping(params = {"page", "size"})
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public Page<PurchaseRequisitionDto> fetchAllPrsWithPagination(Pageable pageable) {
        return prService.getAllPrsWithPagination(pageable);
    }
}
