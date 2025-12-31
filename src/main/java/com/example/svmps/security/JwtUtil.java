package com.example.svmps.security;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.svmps.entity.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // 🔐 Secret key
    private static final String SECRET_KEY =
            "svmps_super_secret_key_which_must_be_very_long_123456789";

    // ⏰ Token validity: 1 hour
    private static final long EXPIRATION_TIME_MS = 1000 * 60 * 60;

    // ✅ Generate JWT token
    public String generateToken(String username, Iterable<Role> roles) {

        List<String> roleNames = ((java.util.Collection<Role>) roles)
                .stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roleNames)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS))
                .signWith(
                        Keys.hmacShaKeyFor(SECRET_KEY.getBytes()),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // ✅ Extract username
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ⏰ Check token expiration
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    // 🔍 Internal helper
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ ADD THIS METHOD (THIS FIXES YOUR ERROR)
    public long getExpirationTimeMs() {
        return EXPIRATION_TIME_MS;
    }
}
