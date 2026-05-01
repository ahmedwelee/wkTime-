package com.wktime.api.user;

import com.wktime.api.auth.AuthUser;
import com.wktime.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUser principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return getById(principal.getId());
    }

    public List<User> listPendingUsers() {
        return userRepository.findByStatus(AccountStatus.PENDING);
    }

    public List<User> listEmployeeAccounts() {
        return userRepository.findByRoleAndStatus(Role.EMPLOYEE, AccountStatus.ACTIVE);
    }

    public User approve(Long userId) {
        User user = getById(userId);
        user.setStatus(AccountStatus.ACTIVE);
        return userRepository.save(user);
    }

    public User reject(Long userId) {
        User user = getById(userId);
        user.setStatus(AccountStatus.REJECTED);
        return userRepository.save(user);
    }

    public User deactivate(Long userId) {
        User user = getById(userId);
        user.setStatus(AccountStatus.INACTIVE);
        return userRepository.save(user);
    }

    public User activate(Long userId) {
        User user = getById(userId);
        user.setStatus(AccountStatus.ACTIVE);
        return userRepository.save(user);
    }
}
