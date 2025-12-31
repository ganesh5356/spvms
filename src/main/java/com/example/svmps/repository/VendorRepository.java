package com.example.svmps.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.svmps.entity.Vendor;

public interface VendorRepository
        extends JpaRepository<Vendor, Long>,
                JpaSpecificationExecutor<Vendor> {
}
