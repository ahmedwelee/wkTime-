package com.wktime.api.auth;

import com.wktime.api.user.AccountStatus;
import com.wktime.api.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record SignupRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            @Size(min = 6) String password
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String token, Long userId, String fullName, String email, Role role, AccountStatus status) {}

    public record MeResponse(Long userId, String fullName, String email, Role role, AccountStatus status) {}
}

