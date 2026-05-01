package com.wktime.api.auth;

import com.wktime.api.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@Valid @RequestBody AuthDtos.SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok(Map.of("message", "Account created and pending admin approval"));
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthDtos.MeResponse me() {
        var user = userService.getCurrentUser();
        return new AuthDtos.MeResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getStatus());
    }
}

