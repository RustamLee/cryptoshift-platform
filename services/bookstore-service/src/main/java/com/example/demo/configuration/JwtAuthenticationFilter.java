package com.example.demo.configuration;

import com.example.demo.user.service.UserServiceImpl;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import io.jsonwebtoken.Claims;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserServiceImpl userDetailsService;


    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        boolean hasAuth = header != null && header.startsWith("Bearer ");
        if (hasAuth) {
            String token = header.substring(7);
            try {
                boolean valid = jwtUtil.validateToken(token);
                if (valid) {
                    String userId = jwtUtil.getUserId(token);
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUserId(userId);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } catch (Exception ex) {
                        try {
                            Claims claims = jwtUtil.parseClaims(token);
                            Object rolesObj = claims.get("roles");
                            java.util.List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                            if (rolesObj instanceof java.util.Collection) {
                                for (Object r : (java.util.Collection<?>) rolesObj) {
                                    if (r != null) authorities.add(new SimpleGrantedAuthority(r.toString()));
                                }
                            }
                            UserDetails fallback = new org.springframework.security.core.userdetails.User(userId, "", authorities);
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(fallback, null, authorities);
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        } catch (Exception inner) {
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        filterChain.doFilter(request, response);
    }
}
