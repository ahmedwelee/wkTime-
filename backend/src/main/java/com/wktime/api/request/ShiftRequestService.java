package com.wktime.api.request;

import com.wktime.api.common.ApiException;
import com.wktime.api.notification.NotificationService;
import com.wktime.api.schedule.Shift;
import com.wktime.api.schedule.ShiftService;
import com.wktime.api.schedule.ShiftStatus;
import com.wktime.api.user.Role;
import com.wktime.api.user.User;
import com.wktime.api.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShiftRequestService {
    private final ShiftRequestRepository shiftRequestRepository;
    private final ShiftService shiftService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ShiftRequestService(
            ShiftRequestRepository shiftRequestRepository,
            ShiftService shiftService,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.shiftRequestRepository = shiftRequestRepository;
        this.shiftService = shiftService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<ShiftRequest> listMine(User user) {
        return shiftRequestRepository.findByRequesterOrderByCreatedAtDesc(user);
    }

    public List<ShiftRequest> listPending() {
        return shiftRequestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.PENDING);
    }

    public ShiftRequest takeShift(Long shiftId, User requester, String message) {
        Shift shift = shiftService.getById(shiftId);
        if (shift.getEmployee() != null && shift.getEmployee().getId().equals(requester.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You are already assigned to this shift");
        }
        if (shift.getStatus() == ShiftStatus.ASSIGNED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This shift is not open for requests");
        }
        ShiftRequest request = new ShiftRequest();
        request.setShift(shift);
        request.setRequester(requester);
        request.setMessage(message);
        request.setUpdatedAt(LocalDateTime.now());
        ShiftRequest saved = shiftRequestRepository.save(request);

        userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .forEach(admin -> notificationService.createShiftRequest(
                        admin,
                        requester.getFullName() + " wants to take " + shift.getTitle()
                ));

        return saved;
    }

    public ShiftRequest approve(Long requestId) {
        ShiftRequest request = getById(requestId);
        request.setStatus(RequestStatus.APPROVED);
        request.setUpdatedAt(LocalDateTime.now());
        Shift shift = request.getShift();
        User previousEmployee = shift.getEmployee();
        shiftService.assignToEmployee(shift, request.getRequester());

        for (ShiftRequest sibling : shiftRequestRepository.findByShiftOrderByCreatedAtDesc(shift)) {
            if (!sibling.getId().equals(request.getId()) && sibling.getStatus() == RequestStatus.PENDING) {
                sibling.setStatus(RequestStatus.REJECTED);
                sibling.setUpdatedAt(LocalDateTime.now());
                shiftRequestRepository.save(sibling);
                notificationService.createApproval(
                        sibling.getRequester(),
                        "Your request for " + shift.getTitle() + " was not approved."
                );
            }
        }

        ShiftRequest saved = shiftRequestRepository.save(request);
        if (previousEmployee != null) {
            notificationService.createApproval(previousEmployee, "Your cover request was approved for " + shift.getTitle());
        }
        notificationService.createApproval(request.getRequester(), "You were approved to take " + shift.getTitle());
        return saved;
    }

    public ShiftRequest reject(Long requestId) {
        ShiftRequest request = getById(requestId);
        request.setStatus(RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());
        ShiftRequest saved = shiftRequestRepository.save(request);
        notificationService.createApproval(request.getRequester(), "Your request for " + request.getShift().getTitle() + " was rejected.");
        return saved;
    }

    private ShiftRequest getById(Long requestId) {
        return shiftRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Shift request not found"));
    }
}
