package com.example.svmps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.svmps.entity.PurchaseRequisition;

public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Long> {
    boolean existsByPrNumber(String prNumber);
    List<PurchaseRequisition> findByStatus(String status);
}
