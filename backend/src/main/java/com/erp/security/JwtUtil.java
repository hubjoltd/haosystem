package com.erp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    
    private final SecretKey secretKey;
    private final long jwtExpiration = 86400000;
    
    public JwtUtil(@Value("${jwt.secret:mySecretKeyForJwtAuthenticationInErpApplication2024}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(String username, String role) {
        return generateToken(username, role, null, false);
    }
    
    public String generateToken(String username, String role, Long branchId, boolean isSuperAdmin) {
        var builder = Jwts.builder()
            .subject(username)
            .claim("role", role)
            .claim("isSuperAdmin", isSuperAdmin)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtExpiration));
        
        if (branchId != null) {
            builder.claim("branchId", branchId);
        }
        
        return builder.signWith(secretKey).compact();
    }
    
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }
    
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }
    
    public Long extractBranchId(String token) {
        Object branchId = getClaims(token).get("branchId");
        if (branchId == null) return null;
        if (branchId instanceof Long) return (Long) branchId;
        if (branchId instanceof Integer) return ((Integer) branchId).longValue();
        return null;
    }
    
    public Boolean extractIsSuperAdmin(String token) {
        Object isSuperAdmin = getClaims(token).get("isSuperAdmin");
        if (isSuperAdmin == null) return false;
        return (Boolean) isSuperAdmin;
    }
    
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    private Claims getClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
