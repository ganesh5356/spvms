package com.example.svmps.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.svmps.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
}
