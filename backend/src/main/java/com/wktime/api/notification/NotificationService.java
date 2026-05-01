package com.wktime.api.notification;

import com.wktime.api.common.ApiException;
import com.wktime.api.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final EmailNotificationService emailNotificationService;

    public NotificationService(NotificationRepository notificationRepository, EmailNotificationService emailNotificationService) {
        this.notificationRepository = notificationRepository;
        this.emailNotificationService = emailNotificationService;
    }

    public void createScheduleUpdate(User user, String message) {
        create(user, NotificationType.SCHEDULE_UPDATE, "WK Time schedule update", message);
    }

    public void createShiftRequest(User user, String message) {
        create(user, NotificationType.SHIFT_REQUEST, "WK Time shift request", message);
    }

    public void createApproval(User user, String message) {
        create(user, NotificationType.APPROVAL, "WK Time approval update", message);
    }

    private void create(User user, NotificationType type, String subject, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notificationRepository.save(notification);
        emailNotificationService.send(user, subject, message);
    }

    public List<Notification> listMine(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(User user, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot modify this notification");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
