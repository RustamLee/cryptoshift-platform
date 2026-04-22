package com.example.demo.configuration;

import com.example.demo.user.service.UserServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final UserServiceImpl userService;
    private final JwtUtil jwtUtil;

    public SecurityConfig(UserServiceImpl userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth-> auth
                    .requestMatchers(HttpMethod.GET, "/api/books/filter").permitAll()
                    .requestMatchers("/api/books/filter").permitAll()
                    .requestMatchers(HttpMethod.GET,"/api/genres","/api/genres/**", "/api/authors", "/api/authors/**", "/api/books", "/api/books/**","/api/sellerProfiles","/api/sellerProfiles/**","/api/sellerProfiles","/api/sellerProfiles/**","api/users").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/users/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/cards","/api/cards/**","/api/sales","/api/sales/**","/api/seller-requests","/api/seller-requests/**").authenticated()
                        .requestMatchers(HttpMethod.POST,"/api/genres", "/api/books", "/api/authors","/api/cards","/api/sales","/api/sellerProfiles","/api/seller-requests").authenticated()
                        .requestMatchers(HttpMethod.PUT,"/api/genres/**", "/api/books/**", "/api/authors/**","/api/cards/**","/api/sales/**","/api/sellerProfiles/**","/api/users/**","/api/seller-requests/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE,"/api/genres/**", "/api/books/**", "/api/authors/**","/api/cards/**","/api/sales/**","/api/sellerProfiles/**","/api/users/**","/api/seller-requests/**").authenticated()
                        .anyRequest().authenticated())
                .userDetailsService(userService)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userService), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}