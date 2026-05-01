package com.wktime.api.notification;

import com.wktime.api.user.UserService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping("/mine")
    public List<NotificationView> mine() {
        var user = userService.getCurrentUser();
        return notificationService.listMine(user).stream().map(NotificationView::from).toList();
    }

    @PatchMapping("/{id}/read")
    public NotificationView markAsRead(@PathVariable Long id) {
        var user = userService.getCurrentUser();
        return NotificationView.from(notificationService.markAsRead(user, id));
    }

    public record NotificationView(Long id, String type, String message, boolean isRead, LocalDateTime createdAt) {
        static NotificationView from(Notification notification) {
            return new NotificationView(
                    notification.getId(),
                    notification.getType().name(),
                    notification.getMessage(),
                    notification.isRead(),
                    notification.getCreatedAt()
            );
        }
    }
}

