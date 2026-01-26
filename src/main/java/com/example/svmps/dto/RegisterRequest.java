package com.example.svmps.dto;

import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    // Username validation
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(
        regexp = "^[a-zA-Z0-9._-]+$",
        message = "Username can contain letters, numbers, dot, underscore, and hyphen only"
    )
    private String username;

    // Password validation
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    // Email validation
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // Roles (optional - users can register without roles)
    private Set<
        @Pattern(
            regexp = "ADMIN|PROCUREMENT|FINANCE|VENDOR",
            message = "Invalid role name"
        )
        String
    > roles;

    // 🔥 VENDOR-SPECIFIC FIELDS (optional, only used if VENDOR role is selected)
    private String phone;
    private String location;
    private String category;

    public RegisterRequest() {}

    // ===== Getters & Setters =====
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Plain password here; service will hash before saving.
     */
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
