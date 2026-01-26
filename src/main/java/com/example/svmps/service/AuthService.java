package com.example.svmps.service;

import com.example.svmps.dto.LoginRequest;
import com.example.svmps.dto.LoginResponse;
import com.example.svmps.dto.RegisterRequest;
import com.example.svmps.dto.RegisterResponse;
import com.example.svmps.entity.Role;
import com.example.svmps.entity.User;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.RoleRepository;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.repository.VendorRepository;
import com.example.svmps.security.JwtUtil;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VendorRepository vendorRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            VendorRepository vendorRepository,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.vendorRepository = vendorRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * ===============================
     * REGISTER (NO EXPIRATION IN RESPONSE)
     * ===============================
     */
    public RegisterResponse register(RegisterRequest req) {

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

        // No default roles - users start with no roles
        user.setRoles(new HashSet<>());
        User savedUser = userRepository.save(user);
        // No vendor profile created during signup - only when admin assigns VENDOR role

        String token = jwtUtil.generateToken(
                savedUser.getUsername(),
                savedUser.getRoles()
        );

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                token
        );
    }

    /**
     * ===============================
     * LOGIN (WITH EXPIRATION)
     * ===============================
     */
    public LoginResponse login(LoginRequest req) {

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalStateException("User account is inactive");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRoles()
        );

        Instant expiresAt = Instant.now()
                .plusMillis(jwtUtil.getExpirationTimeMs());

        return new LoginResponse(token, expiresAt, user.getId());
    }
}
