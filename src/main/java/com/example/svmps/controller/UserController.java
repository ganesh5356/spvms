package com.example.svmps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.svmps.dto.UserDto;
import com.example.svmps.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')") // 🔐 ADMIN ONLY (CLASS LEVEL)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // CREATE USER → ADMIN ONLY
    @PostMapping
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody UserDto dto) {

        UserDto created = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET ALL USERS → ADMIN ONLY
    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    // UPDATE USER → ADMIN ONLY
    @PutMapping("/{id}")
    public UserDto updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDto dto) {

        return userService.updateUser(id, dto);
    }

    // DELETE USER → ADMIN ONLY
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // GET USERS BY ROLE → ADMIN, PROCUREMENT
    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public List<UserDto> getUsersByRole(@PathVariable String roleName) {
        return userService.getUsersByRole(roleName);
    }

    // GET USERS WITH NO ROLES → ADMIN, PROCUREMENT
    @GetMapping("/no-roles")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public List<UserDto> getUsersWithNoRoles() {
        return userService.getUsersWithNoRoles();
    }
}
