package com.example.svmps.repository;

import com.example.svmps.entity.RoleSelectionRequest;
import com.example.svmps.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleSelectionRequestRepository extends JpaRepository<RoleSelectionRequest, Long> {
    List<RoleSelectionRequest> findByStatus(RoleSelectionRequest.RequestStatus status);

    Optional<RoleSelectionRequest> findFirstByUserOrderByCreatedAtDesc(User user);
}
