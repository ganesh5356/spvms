package com.example.svmps.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.svmps.dto.VendorDto;
import com.example.svmps.dto.VendorSearchCriteria;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.VendorRepository;
import com.example.svmps.specification.VendorSpecification;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public VendorDto createVendor(VendorDto dto) {
        Vendor v = new Vendor();
        v.setName(dto.getName());
        v.setContactName(dto.getContactName());
        v.setEmail(dto.getEmail());
        v.setPhone(dto.getPhone());
        v.setAddress(dto.getAddress());
        v.setGstNumber(dto.getGstNumber());
        v.setIsActive(dto.getIsActive() == null ? true : dto.getIsActive());
        Vendor saved = vendorRepository.save(v);
        return toDto(saved);
    }

    public List<VendorDto> getAllVendors() {
        return vendorRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public VendorDto getVendorById(Long id) {
        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + id));
        return toDto(v);
    }

    public VendorDto updateVendor(Long id, VendorDto dto) {
        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + id));

        v.setName(dto.getName());
        v.setContactName(dto.getContactName());
        v.setEmail(dto.getEmail());
        v.setPhone(dto.getPhone());
        v.setAddress(dto.getAddress());
        v.setGstNumber(dto.getGstNumber());

        if (dto.getIsActive() != null) {
            v.setIsActive(dto.getIsActive());
        }

        Vendor saved = vendorRepository.save(v);
        return toDto(saved);
    }

    public void deleteVendor(Long id) {
        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + id));
        v.setIsActive(false); // soft delete
        vendorRepository.save(v);
    }

    // 🔍 SEARCH WITH FILTER + PAGINATION
    public Page<VendorDto> searchVendors(
            VendorSearchCriteria criteria,
            Pageable pageable) {

        Specification<Vendor> spec = VendorSpecification.filter(criteria);

        return vendorRepository.findAll(spec, pageable)
                .map(this::toDto);
    }

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
        return dto;
    }
}
