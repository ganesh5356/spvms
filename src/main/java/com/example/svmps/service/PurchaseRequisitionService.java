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
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PurchaseRequisitionService {

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

    // ================= CREATE PR WITH AUTO CALC TOTAL =================

    public PurchaseRequisitionDto createPr(PurchaseRequisitionDto dto) {

        if (prRepository.existsByPrNumber(dto.getPrNumber())) {
            throw new RuntimeException("PR number already exists");
        }

        if (!userRepository.existsById(dto.getRequesterId())) {
            throw new RuntimeException("Requester not found");
        }

        if (dto.getItems().size() != dto.getQuantities().size() ||
            dto.getItems().size() != dto.getItemAmounts().size()) {

            throw new RuntimeException("Items, quantities, amounts count must match");
        }

        BigDecimal total = BigDecimal.ZERO;

        for (int i = 0; i < dto.getItems().size(); i++) {

            BigDecimal price = dto.getItemAmounts().get(i);
            Integer q = dto.getQuantities().get(i);

            if (q <= 0) {
                throw new RuntimeException("Quantity must be greater than 0");
            }

            total = total.add(price.multiply(BigDecimal.valueOf(q)));
        }

        PurchaseRequisition pr = new PurchaseRequisition();

        pr.setPrNumber(dto.getPrNumber());
        pr.setRequesterId(dto.getRequesterId());
        pr.setStatus("DRAFT");
        pr.setTotalAmount(total);

        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        pr.setVendor(vendor);

        try {
            pr.setItemsJson(mapper.writeValueAsString(dto.getItems()));
            pr.setQuantityJson(mapper.writeValueAsString(dto.getQuantities()));
            pr.setItemAmountJson(mapper.writeValueAsString(dto.getItemAmounts()));
        } catch (Exception e) {
            throw new RuntimeException("JSON convert error");
        }

        PurchaseRequisition saved = prRepository.save(pr);

        return toDto(saved);
    }

    // ================= SUBMIT =================

    public PurchaseRequisitionDto submitPr(Long id) {

        PurchaseRequisition pr = prRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        if (!"DRAFT".equalsIgnoreCase(pr.getStatus())) {
            throw new RuntimeException("Only draft can submit");
        }

        pr.setStatus("SUBMITTED");

        return toDto(prRepository.save(pr));
    }

    // ================= APPROVE =================

    public PurchaseRequisitionDto approvePr(
            Long id, String comments, Long approverId) {

        PurchaseRequisition pr = prRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        if (!"SUBMITTED".equalsIgnoreCase(pr.getStatus())) {
            throw new RuntimeException("Only submitted can approve");
        }

        pr.setStatus("APPROVED");
        prRepository.save(pr);

        ApprovalHistory h = new ApprovalHistory();
        h.setPrId(pr.getId());
        h.setApproverId(approverId);
        h.setAction("APPROVED");
        h.setComments(comments);

        approvalHistoryRepository.save(h);

        createPoForApprovedPr(pr);

        return toDto(pr);
    }

    // ================= REJECT =================

    public PurchaseRequisitionDto rejectPr(
            Long id, String comments, Long approverId) {

        PurchaseRequisition pr = prRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        if (!"SUBMITTED".equalsIgnoreCase(pr.getStatus())) {
            throw new RuntimeException("Only submitted can reject");
        }

        pr.setStatus("REJECTED");
        prRepository.save(pr);

        ApprovalHistory h = new ApprovalHistory();
        h.setPrId(pr.getId());
        h.setApproverId(approverId);
        h.setAction("REJECTED");
        h.setComments(comments);

        approvalHistoryRepository.save(h);

        return toDto(pr);
    }

    // ================= GET BY ID =================

    public PurchaseRequisitionDto getPrById(Long id) {

        PurchaseRequisition pr = prRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        return toDto(pr);
    }

    // ================= GET ALL =================

    public List<PurchaseRequisitionDto> getAllPrs() {
        return prRepository.findAll()
               .stream()
               .map(this::toDto)
               .toList();
    }

    // ================= CREATE PO =================

    private void createPoForApprovedPr(PurchaseRequisition pr) {

        PurchaseOrder po = new PurchaseOrder();

        po.setPoNumber("PO-" + System.currentTimeMillis());
        po.setPr(pr);
        po.setVendor(pr.getVendor());
        po.setTotalAmount(pr.getTotalAmount());
        po.setStatus("DRAFT");

        poRepository.save(po);
    }

    // ================= CONVERTER =================

    private PurchaseRequisitionDto toDto(PurchaseRequisition pr) {

        PurchaseRequisitionDto dto = new PurchaseRequisitionDto();

        dto.setId(pr.getId());
        dto.setPrNumber(pr.getPrNumber());
        dto.setRequesterId(pr.getRequesterId());

        if (pr.getVendor() != null) {
            dto.setVendorId(pr.getVendor().getId());
        }

        dto.setStatus("DRAFT");
        dto.setTotalAmount(pr.getTotalAmount());

        try {

            List<String> items =
                mapper.readValue(pr.getItemsJson(), List.class);
            dto.setItems(items);

            List<Integer> q =
                mapper.readValue(pr.getQuantityJson(), List.class);
            dto.setQuantities(q);

            List<BigDecimal> prices =
                mapper.readValue(pr.getItemAmountJson(), List.class);
            dto.setItemAmounts(prices);

        } catch (Exception e) {}

        return dto;
    }
}
