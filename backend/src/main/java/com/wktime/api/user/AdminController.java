package com.wktime.api.user;

import com.wktime.api.notification.NotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserService userService;
    private final NotificationService notificationService;

    public AdminController(UserService userService, NotificationService notificationService) {
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @GetMapping("/pending-users")
    public List<AdminUserView> pendingUsers() {
        return userService.listPendingUsers().stream().map(AdminUserView::from).toList();
    }

    @GetMapping("/employees")
    public List<AdminUserView> employees() {
        return userService.listEmployeeAccounts().stream().map(AdminUserView::from).toList();
    }

    @PatchMapping("/users/{id}/approve")
    public AdminUserView approve(@PathVariable Long id) {
        User user = userService.approve(id);
        notificationService.createApproval(user, "Your account has been approved. You can now log in to WK Time.");
        return AdminUserView.from(user);
    }

    @PatchMapping("/users/{id}/reject")
    public AdminUserView reject(@PathVariable Long id) {
        User user = userService.reject(id);
        notificationService.createApproval(user, "Your account request was rejected. Please contact the admin team.");
        return AdminUserView.from(user);
    }

    @PatchMapping("/users/{id}/activate")
    public AdminUserView activate(@PathVariable Long id) {
        User user = userService.activate(id);
        notificationService.createApproval(user, "Your account has been activated. You can access WK Time again.");
        return AdminUserView.from(user);
    }

    @PatchMapping("/users/{id}/deactivate")
    public AdminUserView deactivate(@PathVariable Long id) {
        User user = userService.deactivate(id);
        notificationService.createApproval(user, "Your account has been deactivated. Please contact the admin team.");
        return AdminUserView.from(user);
    }

    public record AdminUserView(Long id, String fullName, String email, Role role, AccountStatus status) {
        static AdminUserView from(User user) {
            return new AdminUserView(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getStatus());
        }
    }
}
