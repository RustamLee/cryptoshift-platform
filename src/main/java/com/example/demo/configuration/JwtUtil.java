package com.example.demo.configuration;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret:}")
    private String secretProp;

    @Value("${app.jwt.expiration-ms:}")
    private String expirationMsProp;

    private final Environment env;

    private String secret;
    private long expirationMs = 3600000L;
    private byte[] secretBytes;

    public JwtUtil(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void init() {
        String s = secretProp != null && !secretProp.isBlank() ? secretProp : env.getProperty("app.jwtSecret");
        if (s == null || s.isBlank()) {
            s = "defaultsecretchangethisislongenoughforhs256defaultsecretchangethis";
        }
        byte[] secretBytes = null;
        try {
            byte[] decoded = Base64.getDecoder().decode(s);
            String reencoded = Base64.getEncoder().encodeToString(decoded);
            if (reencoded.equals(s)) {
                secretBytes = decoded;
            }
        } catch (IllegalArgumentException ignored) {
        }

        if (secretBytes != null) {
            this.secret = new String(secretBytes, java.nio.charset.StandardCharsets.UTF_8);
            this.secretBytes = secretBytes;
        } else {
            this.secret = s;
            this.secretBytes = s.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }

        String exp = expirationMsProp != null && !expirationMsProp.isBlank() ? expirationMsProp : env.getProperty("app.jwtExpirationMs");
        if (exp != null && !exp.isBlank()) {
            try {
                this.expirationMs = Long.parseLong(exp);
            } catch (NumberFormatException ignored) {}
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = this.secretBytes != null ? this.secretBytes : secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, List<String> roles) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("roles", roles);

        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody().getSubject();
    }

    public io.jsonwebtoken.Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }
}
