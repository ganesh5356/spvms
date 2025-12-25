package com.example.svmps.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.svmps.dto.VendorDto;
import com.example.svmps.dto.VendorSearchCriteria;
import com.example.svmps.service.VendorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/vendors")
@Tag(name = "Vendor Management APIs")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    // ================= CREATE =================
    @Operation(summary = "Create a new vendor")
    @PostMapping
    public ResponseEntity<VendorDto> createVendor(
            @Valid @RequestBody VendorDto dto) {

        VendorDto created = vendorService.createVendor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ================= READ =================
    @Operation(summary = "Get all vendors")
    @GetMapping
    public ResponseEntity<List<VendorDto>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @Operation(summary = "Get vendor by ID")
    @GetMapping("/{id}")
    public ResponseEntity<VendorDto> getVendorById(
            @PathVariable Long id) {

        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    // ================= UPDATE =================
    @Operation(summary = "Update vendor by ID")
    @PutMapping("/{id}")
    public ResponseEntity<VendorDto> updateVendor(
            @PathVariable Long id,
            @Valid @RequestBody VendorDto dto) {

        return ResponseEntity.ok(vendorService.updateVendor(id, dto));
    }

    // ================= DELETE =================
    @Operation(summary = "Delete vendor by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    // ================= SEARCH =================
    @Operation(summary = "Search vendors with filters, pagination and sorting")
    @GetMapping("/search")
    public ResponseEntity<Page<VendorDto>> searchVendors(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean compliant,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {

        // Pagination + Sorting
        String[] sortArr = sort.split(",");
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(sortArr[1]), sortArr[0])
        );

        // Build search criteria DTO
        VendorSearchCriteria criteria = new VendorSearchCriteria();
        criteria.setCategory(category);
        criteria.setLocation(location);
        criteria.setMinRating(minRating);
        criteria.setCompliance(compliant); // ✅ correct setter

        // Call service
        Page<VendorDto> result = vendorService.searchVendors(criteria, pageable);
        return ResponseEntity.ok(result);
    }
}
