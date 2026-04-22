package com.example.demo.configuration;

import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.service.UserServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserServiceImpl userService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserServiceImpl userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    public static class LoginRequest {
        public String name;
        public String password;

        public LoginRequest() {}
    }

    public static class AuthResponse {
        public String token;
        public UserDTO user;

        public AuthResponse(String token, UserDTO user) {
            this.token = token;
            this.user = user;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.name, req.password)
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            List<String> roles = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
            String token = jwtUtil.generateToken(req.name, roles);

            var user = userService.getCurrentUser();
            if (user.getStatus() != null && "INACTIVE".equalsIgnoreCase(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            UserDTO dto = userService.convertToDTO(user);

            return ResponseEntity.ok(new AuthResponse(token, dto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
