package com.example.svmps.dto;

import java.time.Instant;

public class LoginResponse {

    private String token;
    private Instant expiresAt;

    public LoginResponse() {}

    public LoginResponse(String token, Instant expiresAt) {
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public String getToken() {
        return token;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
