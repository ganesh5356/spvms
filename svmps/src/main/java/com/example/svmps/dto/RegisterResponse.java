package com.example.svmps.dto;

public class RegisterResponse {

    private Long id;
    private String username;
    private String email;

    public RegisterResponse() {}

    public RegisterResponse(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    // ===== Getters & Setters =====
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
