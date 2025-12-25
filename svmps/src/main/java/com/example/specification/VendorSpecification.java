package com.example.svmps.specification;


import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.example.svmps.dto.VendorSearchCriteria;
import com.example.svmps.entity.Vendor;

import jakarta.persistence.criteria.Predicate;

public class VendorSpecification {

    public static Specification<Vendor> filter(VendorSearchCriteria c) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (c.getLocation() != null) {
                predicates.add(cb.equal(root.get("location"), c.getLocation()));
            }

            if (c.getCategory() != null) {
                predicates.add(cb.equal(root.get("category"), c.getCategory()));
            }

            if (c.getCompliance() != null) {   // ✅ FIXED HERE
                predicates.add(cb.equal(root.get("compliance"), c.getCompliance()));
            }

            if (c.getMinRating() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("rating"), c.getMinRating()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
