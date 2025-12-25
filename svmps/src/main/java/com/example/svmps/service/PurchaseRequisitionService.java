package com.example.svmps.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.PurchaseRequisitionDto;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.repository.VendorRepository;


@Service
public class PurchaseRequisitionService {

    private final PurchaseRequisitionRepository prRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final PurchaseOrderRepository poRepository;


    public PurchaseRequisitionService(PurchaseRequisitionRepository prRepository,
                                  VendorRepository vendorRepository,
                                  UserRepository userRepository,
                                  PurchaseOrderRepository poRepository) {
    this.prRepository = prRepository;
    this.vendorRepository = vendorRepository;
    this.userRepository = userRepository;
    this.poRepository = poRepository;
}


    public PurchaseRequisitionDto createPr(PurchaseRequisitionDto dto) {
        // validate unique prNumber
        if (prRepository.existsByPrNumber(dto.getPrNumber())) {
            throw new RuntimeException("PR number already exists: " + dto.getPrNumber());
        }

        // validate requester exists
        if (dto.getRequesterId() == null || !userRepository.existsById(dto.getRequesterId())) {
            throw new RuntimeException("Requester user not found with id: " + dto.getRequesterId());
        }

        PurchaseRequisition pr = new PurchaseRequisition();
        pr.setPrNumber(dto.getPrNumber());
        pr.setRequesterId(dto.getRequesterId());
        pr.setTotalAmount(dto.getTotalAmount());
        pr.setStatus("DRAFT");

        if (dto.getVendorId() != null) {
            Vendor vendor = vendorRepository.findById(dto.getVendorId())
                    .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + dto.getVendorId()));
            pr.setVendor(vendor);
        }

        PurchaseRequisition saved = prRepository.save(pr);
        return toDto(saved);
    }

    public List<PurchaseRequisitionDto> getAllPrs() {
        return prRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public PurchaseRequisitionDto getPrById(Long id) {
        PurchaseRequisition pr = prRepository.findById(id).orElseThrow(() -> new RuntimeException("PR not found: " + id));
        return toDto(pr);
    }

    public PurchaseRequisitionDto updateStatus(Long id, String newStatus) {
    PurchaseRequisition pr = prRepository.findById(id).orElseThrow(() -> new RuntimeException("PR not found: " + id));
    pr.setStatus(newStatus);
    PurchaseRequisition updated = prRepository.save(pr);

    // Inline creation of PO when PR is approved
    if ("APPROVED".equalsIgnoreCase(newStatus)) {
        createPoForApprovedPr(updated);
    }

    return toDto(updated);
}

private void createPoForApprovedPr(PurchaseRequisition pr) {
    // Validate vendor exists on PR
    if (pr.getVendor() == null) {
        throw new RuntimeException("Cannot create PO: PR has no vendor assigned (PR id: " + pr.getId() + ")");
    }

    PurchaseOrder po = new PurchaseOrder();
    po.setPoNumber("PO-" + System.currentTimeMillis()); // simple generator
    po.setPr(pr);
    po.setVendor(pr.getVendor());
    po.setTotalAmount(pr.getTotalAmount());
    po.setStatus("DRAFT");

    poRepository.save(po);
}


    private PurchaseRequisitionDto toDto(PurchaseRequisition pr) {
        PurchaseRequisitionDto dto = new PurchaseRequisitionDto();
        dto.setId(pr.getId());
        dto.setPrNumber(pr.getPrNumber());
        dto.setRequesterId(pr.getRequesterId());
        dto.setStatus(pr.getStatus());
        dto.setTotalAmount(pr.getTotalAmount());
        if (pr.getVendor() != null) dto.setVendorId(pr.getVendor().getId());
        return dto;
    }
}
