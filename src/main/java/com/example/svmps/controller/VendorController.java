package com.example.svmps.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.svmps.dto.VendorDto;
import com.example.svmps.service.VendorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    // CREATE VENDOR
    @PostMapping
    public ResponseEntity<VendorDto> createVendor(
            @Valid @RequestBody VendorDto dto) {

        VendorDto created = vendorService.createVendor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET ALL VENDORS
    @GetMapping
    public List<VendorDto> getAllVendors() {
        return vendorService.getAllVendors();
    }

    // GET VENDOR BY ID
    @GetMapping("/{id}")
    public VendorDto getVendorById(@PathVariable Long id) {
        return vendorService.getVendorById(id);
    }

    // UPDATE VENDOR
    @PutMapping("/{id}")
    public VendorDto updateVendor(
            @PathVariable Long id,
            @Valid @RequestBody VendorDto dto) {

        return vendorService.updateVendor(id, dto);
    }

    // DELETE (SOFT DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.ok("Vendor with id " + id + " has been soft deleted.");
    }

    // HARD DELETE (PERMANENT)
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<String> hardDeleteVendor(@PathVariable Long id) {
        vendorService.hardDeleteVendor(id);
        return ResponseEntity.ok("Vendor with id " + id + " has been permanently deleted.");
    }

    //  SEARCH VENDORS 
    @GetMapping("/search")
    public Page<VendorDto> searchVendors(
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean compliant,
            Pageable pageable) {

        return vendorService.searchVendors(
                rating, location, category, compliant, pageable);
    }
}
