package com.wktime.api.user;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/active-employees")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserCard> activeEmployees() {
        return userRepository.findAll().stream()
                .filter(u -> u.getStatus() == AccountStatus.ACTIVE && u.getRole() == Role.EMPLOYEE)
                .map(u -> new UserCard(u.getId(), u.getFullName(), u.getEmail()))
                .toList();
    }

    public record UserCard(Long id, String fullName, String email) {}
}

