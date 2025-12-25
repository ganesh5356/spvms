package com.example.svmps.service;

import com.example.svmps.dto.RegisterRequest;
import com.example.svmps.dto.RegisterResponse;
import com.example.svmps.entity.Role;
import com.example.svmps.entity.User;
import com.example.svmps.repository.RoleRepository;
import com.example.svmps.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public RegisterResponse register(RegisterRequest req) {
        // basic validations
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new IllegalArgumentException("username is required");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("password must be at least 6 characters");
        }
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new IllegalArgumentException("email is required");
        }

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        user.setIsActive(true);

        Set<Role> assigned = new HashSet<>();
        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            for (String rname : req.getRoles()) {
                Role r = roleRepository.findByName(rname)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + rname));
                assigned.add(r);
            }
        } else {
            // default role for self-registered users
            Role defaultRole = roleRepository.findByName("VENDOR")
                    .orElseThrow(() -> new IllegalStateException("Default role VENDOR not found"));
            assigned.add(defaultRole);
        }

        user.setRoles(assigned);
        User saved = userRepository.save(user);

        return new RegisterResponse(saved.getId(), saved.getUsername(), saved.getEmail());
    }
}
