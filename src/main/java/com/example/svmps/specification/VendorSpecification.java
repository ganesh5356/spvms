package com.example.svmps.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.svmps.entity.Vendor;

public class VendorSpecification {

    public static Specification<Vendor> hasRating(Double rating) {
        return (root, query, cb) -> rating == null ? null : cb.greaterThanOrEqualTo(root.get("rating"), rating);
    }

    public static Specification<Vendor> hasLocation(String location) {
        return (root, query, cb) -> location == null ? null : cb.equal(root.get("location"), location);
    }

    public static Specification<Vendor> hasCategory(String category) {
        return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Vendor> isCompliant(Boolean compliant) {
        return (root, query, cb) -> compliant == null ? null : cb.equal(root.get("compliant"), compliant);
    }

    public static Specification<Vendor> isActive(Boolean isActive) {
        return (root, query, cb) -> isActive == null ? null : cb.equal(root.get("isActive"), isActive);
    }
}
