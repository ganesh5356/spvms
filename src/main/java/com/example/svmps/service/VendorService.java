package com.example.svmps.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.svmps.dto.VendorDto;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.VendorRepository;
import org.springframework.transaction.annotation.Transactional;


@Service
public class VendorService {

    private final VendorRepository vendorRepository;
    private final PurchaseRequisitionRepository purchaseRequisitionRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public VendorService(VendorRepository vendorRepository, PurchaseRequisitionRepository purchaseRequisitionRepository, PurchaseOrderRepository purchaseOrderRepository) {
        this.vendorRepository = vendorRepository;
        this.purchaseRequisitionRepository = purchaseRequisitionRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    // CREATE VENDOR
    public VendorDto createVendor(VendorDto dto) {

        Vendor v = new Vendor();
        v.setName(dto.getName());
        v.setContactName(dto.getContactName());
        v.setEmail(dto.getEmail());
        v.setPhone(dto.getPhone());
        v.setAddress(dto.getAddress());
        v.setGstNumber(dto.getGstNumber());
        v.setIsActive(dto.getIsActive() == null ? true : dto.getIsActive());

        // Search-related fields
        v.setRating(dto.getRating());
        v.setLocation(dto.getLocation());
        v.setCategory(dto.getCategory());
        v.setCompliant(dto.getCompliant());

        Vendor saved = vendorRepository.save(v);
        return toDto(saved);
    }

    // GET ALL VENDORS
    public List<VendorDto> getAllVendors() {
        return vendorRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // GET VENDOR BY ID
    public VendorDto getVendorById(Long id) {
        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        return toDto(v);
    }

    // UPDATE VENDOR
    public VendorDto updateVendor(Long id, VendorDto dto) {

        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));

        v.setName(dto.getName());
        v.setContactName(dto.getContactName());
        v.setEmail(dto.getEmail());
        v.setPhone(dto.getPhone());
        v.setAddress(dto.getAddress());
        v.setGstNumber(dto.getGstNumber());

        if (dto.getIsActive() != null) {
            v.setIsActive(dto.getIsActive());
        }

        // Update search-related fields
        v.setRating(dto.getRating());
        v.setLocation(dto.getLocation());
        v.setCategory(dto.getCategory());
        v.setCompliant(dto.getCompliant());

        Vendor updated = vendorRepository.save(v);
        return toDto(updated);
    }

    // SOFT DELETE VENDOR
    public void deleteVendor(Long id) {
        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        v.setIsActive(false);
        vendorRepository.save(v);
    }



@Transactional
public void hardDeleteVendor(Long id) {

    Vendor v = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));

    // 1️⃣ Get PRs of vendor
    List<PurchaseRequisition> purchaseRequisitions =
            purchaseRequisitionRepository.findByVendorId(id);

    // 2️⃣ Delete POs first
    for (PurchaseRequisition pr : purchaseRequisitions) {
        List<PurchaseOrder> purchaseOrders =
              purchaseOrderRepository.findByPrId(pr.getId());




        if (!purchaseOrders.isEmpty()) {
            purchaseOrderRepository.deleteAll(purchaseOrders);
        }
    }

    // 3️⃣ Delete PRs
    if (!purchaseRequisitions.isEmpty()) {
        purchaseRequisitionRepository.deleteAll(purchaseRequisitions);
    }

    // 4️⃣ Delete Vendor
    vendorRepository.delete(v);
}


    // ENTITY → DTO MAPPER
    private VendorDto toDto(Vendor v) {

        VendorDto dto = new VendorDto();
        dto.setId(v.getId());
        dto.setName(v.getName());
        dto.setContactName(v.getContactName());
        dto.setEmail(v.getEmail());
        dto.setPhone(v.getPhone());
        dto.setAddress(v.getAddress());
        dto.setGstNumber(v.getGstNumber());
        dto.setIsActive(v.getIsActive());

        // Search-related fields
        dto.setRating(v.getRating());
        dto.setLocation(v.getLocation());
        dto.setCategory(v.getCategory());
        dto.setCompliant(v.getCompliant());

        return dto;
    }

    public Page<VendorDto> searchVendors(Double rating, String location, String category, Boolean compliant, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Vendor> spec =
                org.springframework.data.jpa.domain.Specification.where(
                        com.example.svmps.specification.VendorSpecification.hasRating(rating))
                        .and(com.example.svmps.specification.VendorSpecification.hasLocation(location))
                        .and(com.example.svmps.specification.VendorSpecification.hasCategory(category))
                        .and(com.example.svmps.specification.VendorSpecification.isCompliant(compliant));

        return vendorRepository.findAll(spec, pageable).map(this::toDto);
    }
}
