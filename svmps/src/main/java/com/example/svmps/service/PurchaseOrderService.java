package com.example.svmps.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.PurchaseOrderDto;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.example.svmps.repository.VendorRepository;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final PurchaseRequisitionRepository prRepository;
    private final VendorRepository vendorRepository;

    public PurchaseOrderService(PurchaseOrderRepository poRepository,
                                PurchaseRequisitionRepository prRepository,
                                VendorRepository vendorRepository) {
        this.poRepository = poRepository;
        this.prRepository = prRepository;
        this.vendorRepository = vendorRepository;
    }

    public PurchaseOrderDto createPoFromPr(Long prId, PurchaseOrderDto dto) {
        PurchaseRequisition pr = prRepository.findById(prId).orElseThrow(() -> new RuntimeException("PR not found: " + prId));
        if (!"APPROVED".equals(pr.getStatus())) {
            throw new RuntimeException("PR must be APPROVED to create PO.");
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(dto.getPoNumber());
        po.setPr(pr);

        Vendor vendor = null;
        if (dto.getVendorId() != null) {
            vendor = vendorRepository.findById(dto.getVendorId())
                    .orElseThrow(() -> new RuntimeException("Vendor not found: " + dto.getVendorId()));
        } else if (pr.getVendor() != null) {
            vendor = pr.getVendor();
        } else {
            throw new RuntimeException("Vendor must be specified either in PR or PO payload.");
        }

        po.setVendor(vendor);
        po.setTotalAmount(dto.getTotalAmount());
        po.setStatus("DRAFT");

        PurchaseOrder saved = poRepository.save(po);
        return toDto(saved);
    }

    public List<PurchaseOrderDto> getAllPos() {
        return poRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public PurchaseOrderDto getPoById(Long id) {
        PurchaseOrder po = poRepository.findById(id).orElseThrow(() -> new RuntimeException("PO not found: " + id));
        return toDto(po);
    }

    public PurchaseOrderDto updateStatus(Long id, String newStatus) {
        PurchaseOrder po = poRepository.findById(id).orElseThrow(() -> new RuntimeException("PO not found: " + id));
        po.setStatus(newStatus);
        PurchaseOrder updated = poRepository.save(po);
        return toDto(updated);
    }

    private PurchaseOrderDto toDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        if (po.getPr() != null) dto.setPrId(po.getPr().getId());
        if (po.getVendor() != null) dto.setVendorId(po.getVendor().getId());
        dto.setStatus(po.getStatus());
        dto.setTotalAmount(po.getTotalAmount());
        return dto;
    }
}
