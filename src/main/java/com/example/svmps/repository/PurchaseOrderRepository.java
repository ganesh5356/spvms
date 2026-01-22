package com.example.svmps.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.svmps.entity.PurchaseOrder;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

   List<PurchaseOrder> findByPrId(Long prId);

}
