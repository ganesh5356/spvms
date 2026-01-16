package com.example.svmps.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.PurchaseOrderDto;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepo;
    private final PurchaseRequisitionRepository prRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PurchaseOrderService(PurchaseOrderRepository poRepo,
                                PurchaseRequisitionRepository prRepo) {
        this.poRepo = poRepo;
        this.prRepo = prRepo;
    }

    // ================= CREATE PO =================
    public PurchaseOrderDto createPo(Long prId, BigDecimal cgstPercent, BigDecimal sgstPercent, BigDecimal igstPercent) {

        PurchaseRequisition pr = prRepo.findById(prId)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        if (!"APPROVED".equals(pr.getStatus())) {
            throw new RuntimeException("PR is not APPROVED");
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber("PO-" + System.currentTimeMillis());
        po.setPrId(prId);
        po.setBaseAmount(pr.getTotalAmount());
        po.setItemsJson(pr.getItemsJson());
        po.setQuantityJson(pr.getQuantityJson());

        int totalQty = extractTotalQuantity(pr.getQuantityJson());
        po.setTotalQuantity(totalQty);

        po.setCgstPercent(cgstPercent);
        po.setSgstPercent(sgstPercent);
        po.setIgstPercent(igstPercent);

        // Calculate individual GST amounts
        BigDecimal cgstAmount = pr.getTotalAmount()
                .multiply(cgstPercent)
                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

        BigDecimal sgstAmount = pr.getTotalAmount()
                .multiply(sgstPercent)
                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

        BigDecimal igstAmount = pr.getTotalAmount()
                .multiply(igstPercent)
                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

        po.setCgstAmount(cgstAmount);
        po.setSgstAmount(sgstAmount);
        po.setIgstAmount(igstAmount);

        // Total GST = CGST + SGST + IGST
        BigDecimal totalGstAmount = cgstAmount.add(sgstAmount).add(igstAmount);
        po.setTotalGstAmount(totalGstAmount);

        // Total Amount = Base Amount + Total GST
        po.setTotalAmount(pr.getTotalAmount().add(totalGstAmount));
        po.setDeliveredQuantity(0);
        po.setStatus("CREATED");

        return toDto(poRepo.save(po));
    }

    // ================= DELIVERY =================
    public PurchaseOrderDto updateDelivery(Long poId, Integer deliveredQty) {

        PurchaseOrder po = poRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        int totalDelivered = po.getDeliveredQuantity() + deliveredQty;

        if (totalDelivered > po.getTotalQuantity()) {
            throw new RuntimeException("Delivered quantity exceeds ordered quantity");
        }

        po.setDeliveredQuantity(totalDelivered);

        if (totalDelivered == po.getTotalQuantity()) {
            po.setStatus("DELIVERED");
        } else {
            po.setStatus("PARTIAL_DELIVERED");
        }

        return toDto(poRepo.save(po));
    }

    // ================= CLOSE PO =================
    public PurchaseOrderDto closePo(Long poId) {

        PurchaseOrder po = poRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        if (!"DELIVERED".equals(po.getStatus())) {
            throw new RuntimeException("PO is not fully delivered");
        }

        po.setStatus("CLOSED");
        return toDto(poRepo.save(po));
    }

    // ================= GET PO BY ID =================
    public PurchaseOrderDto getPoById(Long poId) {

        PurchaseOrder po = poRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        return toDto(po);
    }

    // ================= GET ALL POs =================
    public List<PurchaseOrderDto> getAllPos() {

        return poRepo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ================= GET POs BY PR ID =================
    public List<PurchaseOrderDto> getPosByPrId(Long prId) {

        return poRepo.findAll()
                .stream()
                .filter(po -> po.getPrId().equals(prId))
                .map(this::toDto)
                .toList();
    }

    // ================= HELPER: TOTAL QUANTITY =================
    private int extractTotalQuantity(String quantityJson) {

        if (quantityJson == null || quantityJson.isBlank()) {
            return 0;
        }

        try {
            List<Integer> quantities =
                    objectMapper.readValue(quantityJson, List.class);

            int total = 0;
            for (Integer q : quantities) {
                total += q;
            }
            return total;

        } catch (Exception e) {
            throw new RuntimeException("Invalid quantity JSON format");
        }
    }

    // ================= DTO MAPPER =================
   private PurchaseOrderDto toDto(PurchaseOrder po) {

    PurchaseOrderDto dto = new PurchaseOrderDto();

    // NULL SAFE VALUES
    Integer totalQty = po.getTotalQuantity() != null ? po.getTotalQuantity() : 0;
    Integer deliveredQty = po.getDeliveredQuantity() != null ? po.getDeliveredQuantity() : 0;

    dto.setId(po.getId());
    dto.setPoNumber(po.getPoNumber());
    dto.setPrId(po.getPrId());
    dto.setStatus(po.getStatus());
    dto.setBaseAmount(po.getBaseAmount());
    dto.setCgstPercent(po.getCgstPercent());
    dto.setSgstPercent(po.getSgstPercent());
    dto.setIgstPercent(po.getIgstPercent());
    dto.setCgstAmount(po.getCgstAmount());
    dto.setSgstAmount(po.getSgstAmount());
    dto.setIgstAmount(po.getIgstAmount());
    dto.setTotalGstAmount(po.getTotalGstAmount());
    dto.setTotalAmount(po.getTotalAmount());
    dto.setTotalQuantity(totalQty);
    dto.setDeliveredQuantity(deliveredQty);

    int remainingQty = totalQty - deliveredQty;
    dto.setRemainingQuantity(remainingQty);

    if (totalQty > 0 && po.getTotalAmount() != null) {
        BigDecimal perUnitAmount =
                po.getTotalAmount()
                  .divide(BigDecimal.valueOf(totalQty), 2, BigDecimal.ROUND_HALF_UP);

        dto.setBalanceAmount(
                perUnitAmount.multiply(BigDecimal.valueOf(remainingQty))
        );
    } else {
        dto.setBalanceAmount(BigDecimal.ZERO);
    }

    return dto;
}

}
