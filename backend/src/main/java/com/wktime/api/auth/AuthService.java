package com.wktime.api.auth;

import com.wktime.api.common.ApiException;
import com.wktime.api.user.AccountStatus;
import com.wktime.api.user.Role;
import com.wktime.api.user.User;
import com.wktime.api.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public void signup(AuthDtos.SignupRequest request) {
        if (userRepository.findByEmail(request.email().toLowerCase()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.EMPLOYEE);
        user.setStatus(AccountStatus.PENDING);
        userRepository.save(user);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, statusMessage(user.getStatus()));
        }
        String token = jwtService.createToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthDtos.AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getStatus());
    }

    private String statusMessage(AccountStatus status) {
        return switch (status) {
            case PENDING -> "Account is pending admin approval";
            case INACTIVE -> "Account is inactive. Please contact the admin team";
            case REJECTED -> "Account request was rejected";
            default -> "Account is not active";
        };
    }
}
