package com.example.svmps.repository;

import java.util.List;
import java.util.Optional; // 🔥 THIS WAS MISSING

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.svmps.entity.Vendor;

public interface VendorRepository
                extends JpaRepository<Vendor, Long>,
                JpaSpecificationExecutor<Vendor> {

        // Used for soft delete filtering
        List<Vendor> findByIsActiveTrue();

        // Used to map JWT username → vendor
        Optional<Vendor> findByEmail(String email);

        // 🔥 NEW: Find vendor by linked User ID
        Optional<Vendor> findByUserId(Long userId);
}
