package com.example.svmps.controller;

import com.example.svmps.entity.RoleSelectionRequest;
import com.example.svmps.entity.User;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.service.RoleRequestService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/role-requests")
public class RoleRequestController {

    private final RoleRequestService roleRequestService;
    private final UserRepository userRepository;
    private final com.example.svmps.repository.RoleSelectionRequestRepository requestRepository;

    public RoleRequestController(RoleRequestService roleRequestService,
            UserRepository userRepository,
            com.example.svmps.repository.RoleSelectionRequestRepository requestRepository) {
        this.roleRequestService = roleRequestService;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitRequest(
            Authentication authentication,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "gstNumber", required = false) String gstNumber,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "rating", required = false) String ratingStr,
            @RequestParam(value = "details", required = false) String details,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        System.out.println("DEBUG: submitRequest triggered for role: " + role);
        System.out.println("DEBUG: Params - fullName: " + fullName + ", email: " + email + ", phone: " + phone);
        System.out.println(
                "DEBUG: Vendor info - location: " + location + ", gst: " + gstNumber + ", rating: " + ratingStr);
        System.out.println("DEBUG: File: "
                + (file != null ? (file.getOriginalFilename() + " [" + file.getSize() + " bytes]") : "NULL"));

        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            if (role == null) {
                return ResponseEntity.badRequest().body("Role parameter is missing");
            }

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is required");
            }

            Double rating = null;
            if ("VENDOR".equalsIgnoreCase(role) && ratingStr != null && !ratingStr.trim().isEmpty()) {
                try {
                    rating = Double.parseDouble(ratingStr);
                } catch (NumberFormatException e) {
                    System.err.println("Invalid rating: " + ratingStr);
                }
            }

            RoleSelectionRequest saved = roleRequestService.submitRequest(
                    user, role, fullName, email, phone, location, category, gstNumber, address, rating, details, file);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("Role Request Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Submission failed: " + e.getMessage());
        }
    }

    @GetMapping("/my-request")
    public ResponseEntity<RoleSelectionRequest> getMyRequest(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(roleRequestService.getLatestRequest(user));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RoleSelectionRequest> getPendingRequests() {
        return roleRequestService.getPendingRequests();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleSelectionRequest> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(roleRequestService.approveRequest(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleSelectionRequest> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(roleRequestService.rejectRequest(id));
    }

    @GetMapping("/document/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> getDocument(@PathVariable Long id) throws IOException {
        RoleSelectionRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        Path path = Paths.get(request.getDocumentPath());
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + path.getFileName().toString() + "\"")
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}
