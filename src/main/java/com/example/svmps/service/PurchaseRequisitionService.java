package com.example.svmps.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.PurchaseRequisitionDto;
import com.example.svmps.entity.ApprovalHistory;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.ApprovalHistoryRepository;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.repository.VendorRepository;
import com.example.svmps.util.PrStatus;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PurchaseRequisitionService {

    // max PR limit set to 500,000
    private static final BigDecimal MAX_PR_LIMIT = new BigDecimal("500000");

    private final PurchaseRequisitionRepository prRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final PurchaseOrderRepository poRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    public PurchaseRequisitionService(
            PurchaseRequisitionRepository prRepository,
            VendorRepository vendorRepository,
            UserRepository userRepository,
            PurchaseOrderRepository poRepository,
            ApprovalHistoryRepository approvalHistoryRepository) {

        this.prRepository = prRepository;
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.poRepository = poRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
    }

    // ================= PR NUMBER =================
    private String generatePrNumber() {
        return "PR-" + System.currentTimeMillis();
    }

    // ================= CREATE PR =================
    public PurchaseRequisitionDto createPr(PurchaseRequisitionDto dto) {

        if (!userRepository.existsById(dto.getRequesterId())) {
            throw new RuntimeException("Requester not found");
        }

        validateItems(dto);

        BigDecimal total = calculateTotal(dto);
        validateBudget(total);

        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        if (!vendor.getIsActive()) {
            throw new RuntimeException("Vendor is inactive. We cannot create PR with an inactive vendor");
        }

        PurchaseRequisition pr = new PurchaseRequisition();
        pr.setPrNumber(generatePrNumber());
        pr.setRequesterId(dto.getRequesterId());
        pr.setVendor(vendor);
        pr.setStatus(PrStatus.DRAFT);
        pr.setTotalAmount(total);

        saveJsonItems(pr, dto);

        return toDto(prRepository.save(pr));
    }

    // ================= UPDATE PR =================
    public PurchaseRequisitionDto updatePr(Long id, PurchaseRequisitionDto dto) {

        PurchaseRequisition pr = getPr(id);

        if (!PrStatus.DRAFT.equals(pr.getStatus())) {
            throw new RuntimeException("Only DRAFT PR can be updated");
        }

        validateItems(dto);

        BigDecimal total = calculateTotal(dto);
        validateBudget(total);

        pr.setTotalAmount(total);
        saveJsonItems(pr, dto);

        return toDto(prRepository.save(pr));
    }

    // ================= SUBMIT =================
    public PurchaseRequisitionDto submitPr(Long id) {

        PurchaseRequisition pr = getPr(id);

        if (!PrStatus.DRAFT.equals(pr.getStatus())) {
            throw new RuntimeException("Only DRAFT can submit");
        }

        pr.setStatus(PrStatus.SUBMITTED);
        return toDto(prRepository.save(pr));
    }

    // ================= APPROVE =================
    public PurchaseRequisitionDto approvePr(
            Long id, String comments, Long approverId) {

        PurchaseRequisition pr = getPr(id);

        if (!PrStatus.SUBMITTED.equals(pr.getStatus())) {
            throw new RuntimeException("Only SUBMITTED can approve");
        }

        pr.setStatus(PrStatus.APPROVED);
        prRepository.save(pr);

        saveHistory(pr, approverId, "APPROVED", comments);
        
        return toDto(pr);
    }

    // ================= REJECT =================
    public PurchaseRequisitionDto rejectPr(
            Long id, String comments, Long approverId) {

        PurchaseRequisition pr = getPr(id);

        if (!PrStatus.SUBMITTED.equals(pr.getStatus())) {
            throw new RuntimeException("Only SUBMITTED can reject");
        }

        pr.setStatus(PrStatus.REJECTED);
        prRepository.save(pr);

        saveHistory(pr, approverId, "REJECTED", comments);

        return toDto(pr);
    }

    // ================= GET BY ID =================
    public PurchaseRequisitionDto getPrById(Long id) {
        return toDto(getPr(id));
    }

    // ================= GET ALL =================
    public List<PurchaseRequisitionDto> getAllPrs() {
        return prRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ================= HELPERS =================

    private PurchaseRequisition getPr(Long id) {
        return prRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR not found"));
    }

    private void validateItems(PurchaseRequisitionDto dto) {
        if (dto.getItems().size() != dto.getQuantities().size()
                || dto.getItems().size() != dto.getItemAmounts().size()) {
            throw new RuntimeException("Items, quantities and amounts must match");
        }
    }

    private BigDecimal calculateTotal(PurchaseRequisitionDto dto) {
        BigDecimal total = BigDecimal.ZERO;
        for (int i = 0; i < dto.getItems().size(); i++) {
            total = total.add(
                    dto.getItemAmounts().get(i)
                            .multiply(BigDecimal.valueOf(dto.getQuantities().get(i)))
            );
        }
        return total;
    }

    private void validateBudget(BigDecimal total) {
        if (total.compareTo(MAX_PR_LIMIT) > 0) {
            throw new RuntimeException("PR exceeds budget limit");
        }
    }

    private void saveJsonItems(PurchaseRequisition pr, PurchaseRequisitionDto dto) {
        try {
            pr.setItemsJson(mapper.writeValueAsString(dto.getItems()));
            pr.setQuantityJson(mapper.writeValueAsString(dto.getQuantities()));
            pr.setItemAmountJson(mapper.writeValueAsString(dto.getItemAmounts()));
        } catch (Exception e) {
            throw new RuntimeException("JSON conversion error");
        }
    }

    private void saveHistory(
            PurchaseRequisition pr,
            Long approverId,
            String action,
            String comments) {

        ApprovalHistory h = new ApprovalHistory();
        h.setPrId(pr.getId());
        h.setApproverId(approverId);
        h.setAction(action);
        h.setComments(comments);

        approvalHistoryRepository.save(h);
    }

    

    // ================= DTO CONVERTER =================
    private PurchaseRequisitionDto toDto(PurchaseRequisition pr) {

        PurchaseRequisitionDto dto = new PurchaseRequisitionDto();
        dto.setId(pr.getId());
        dto.setPrNumber(pr.getPrNumber());
        dto.setRequesterId(pr.getRequesterId());
        dto.setVendorId(pr.getVendor().getId());
        dto.setStatus(pr.getStatus());
        dto.setTotalAmount(pr.getTotalAmount());

        try {
            dto.setItems(mapper.readValue(pr.getItemsJson(), List.class));
            dto.setQuantities(mapper.readValue(pr.getQuantityJson(), List.class));
            dto.setItemAmounts(mapper.readValue(pr.getItemAmountJson(), List.class));
        } catch (Exception e) {}

        return dto;
    }
}
