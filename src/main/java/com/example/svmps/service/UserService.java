package com.example.svmps.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.UserDto;
import com.example.svmps.entity.Role;
import com.example.svmps.entity.User;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.RoleRepository;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.repository.VendorRepository;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VendorRepository vendorRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, VendorRepository vendorRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto createUser(UserDto dto) {
        User u = new User();
        u.setUsername(dto.getUsername());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setEmail(dto.getEmail());
        u.setIsActive(dto.getIsActive() == null ? true : dto.getIsActive());

        // Assign roles if provided
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            Set<Role> userRoles = new HashSet<>();
            for (String roleName : dto.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
                userRoles.add(role);
            }
            u.setRoles(userRoles);
        }

        User saved = userRepository.save(u);
        return toDto(saved);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName).stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setUsername(dto.getUsername());
        u.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getIsActive() != null) {
            u.setIsActive(dto.getIsActive());
        }

        // Update roles if provided
        if (dto.getRoles() != null) { // Update roles if provided (even if empty list to remove all roles)
            Set<Role> userRoles = new HashSet<>();
            boolean hadVendorRoleBefore = u.getRoles().stream().anyMatch(role -> "VENDOR".equals(role.getName()));

            for (String roleName : dto.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
                userRoles.add(role);
            }
            u.setRoles(userRoles);

            // If VENDOR role is being assigned and user didn't have it before, create
            // vendor profile
            boolean hasVendorRoleNow = userRoles.stream().anyMatch(role -> "VENDOR".equals(role.getName()));
            if (hasVendorRoleNow && !hadVendorRoleBefore) {
                if (!vendorRepository.findByEmail(u.getEmail()).isPresent()) {
                    Vendor v = new Vendor();
                    v.setUser(u); // Link to the user
                    v.setName(u.getUsername() + " Company");
                    v.setEmail(u.getEmail());
                    v.setContactName(u.getUsername());
                    v.setPhone("0000000000");
                    v.setAddress("Not Provided");

                    v.setGstNumber("00AAAAA0000A0Z0");
                    v.setIsActive(true);
                    v.setCompliant(true);
                    v.setRating(5.0);
                    v.setLocation("Default");
                    v.setCategory("Default");
                    vendorRepository.save(v);
                }
            } else if (!hasVendorRoleNow && hadVendorRoleBefore) {
                // 🔥 Role removed: Deactivate vendor profile
                vendorRepository.findByUserId(u.getId()).ifPresent(v -> {
                    v.setIsActive(false);
                    vendorRepository.save(v);
                });
            }
        }

        User saved = userRepository.save(u);
        return toDto(saved);
    }

    public void deleteUser(Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(u);
    }

    public List<UserDto> getUsersWithNoRoles() {
        return userRepository.findByRolesIsEmpty()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public UserDto toDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setIsActive(u.getIsActive());

        // Extract role names from the user's roles
        Set<String> roleNames = u.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());
        dto.setRoles(roleNames);

        return dto;
    }
}
