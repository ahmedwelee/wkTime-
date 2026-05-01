package com.wktime.api.schedule;

import com.wktime.api.common.ApiException;
import com.wktime.api.notification.NotificationService;
import com.wktime.api.user.User;
import com.wktime.api.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShiftService {
    private final ShiftRepository shiftRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public ShiftService(ShiftRepository shiftRepository, UserService userService, NotificationService notificationService) {
        this.shiftRepository = shiftRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public List<Shift> listMine(User user) {
        return shiftRepository.findByEmployeeOrderByStartAtAsc(user);
    }

    public List<Shift> listAll() {
        return shiftRepository.findAllByOrderByStartAtAsc();
    }

    public List<Shift> listOpen() {
        return shiftRepository.findByStatusOrderByStartAtAsc(ShiftStatus.OPEN);
    }

    public Shift create(ShiftDtos.ShiftUpsertRequest request) {
        validateRange(request.startAt(), request.endAt());
        Shift shift = new Shift();
        shift.setTitle(request.title());
        shift.setStartAt(request.startAt());
        shift.setEndAt(request.endAt());
        shift.setNotes(request.notes());
        applyAssignment(shift, request.employeeId());
        shift.setPublished(request.published());
        Shift saved = shiftRepository.save(shift);
        // Log created shift details to help diagnose missing assignments
        System.out.println("ShiftService.create: saved shift id=" + saved.getId() + ", employeeId=" + (saved.getEmployee() != null ? saved.getEmployee().getId() : "null") + ", title=" + saved.getTitle());
        if (saved.getEmployee() != null) {
            notificationService.createScheduleUpdate(saved.getEmployee(), "A new shift was added: " + saved.getTitle());
        }
        return saved;
    }

    public Shift update(Long shiftId, ShiftDtos.ShiftUpsertRequest request) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Shift not found"));
        validateRange(request.startAt(), request.endAt());
        shift.setTitle(request.title());
        shift.setStartAt(request.startAt());
        shift.setEndAt(request.endAt());
        shift.setNotes(request.notes());
        applyAssignment(shift, request.employeeId());
        shift.setPublished(request.published());
        shift.setUpdatedAt(LocalDateTime.now());
        Shift saved = shiftRepository.save(shift);
        if (saved.getEmployee() != null) {
            notificationService.createScheduleUpdate(saved.getEmployee(), "Your shift was updated: " + saved.getTitle());
        }
        return saved;
    }

    public void delete(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Shift not found"));
        if (shift.getEmployee() != null) {
            notificationService.createScheduleUpdate(shift.getEmployee(), "A shift was removed: " + shift.getTitle());
        }
        shiftRepository.delete(shift);
    }

    public Shift publish(Long shiftId) {
        Shift shift = getById(shiftId);
        shift.setPublished(true);
        shift.setUpdatedAt(LocalDateTime.now());
        Shift saved = shiftRepository.save(shift);
        if (saved.getEmployee() != null) {
            notificationService.createScheduleUpdate(saved.getEmployee(), "Your schedule was published for shift: " + saved.getTitle());
        }
        return saved;
    }

    public Shift requestCover(Long shiftId, User currentUser) {
        Shift shift = getById(shiftId);
        if (shift.getEmployee() == null || !shift.getEmployee().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only request cover for your own assigned shift");
        }
        shift.setStatus(ShiftStatus.OPEN);
        shift.setUpdatedAt(LocalDateTime.now());
        return shiftRepository.save(shift);
    }

    public Shift assignToEmployee(Shift shift, User newEmployee) {
        shift.setEmployee(newEmployee);
        shift.setStatus(ShiftStatus.ASSIGNED);
        shift.setUpdatedAt(LocalDateTime.now());
        return shiftRepository.save(shift);
    }

    public Shift getById(Long shiftId) {
        return shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Shift not found"));
    }

    private void applyAssignment(Shift shift, Long employeeId) {
        if (employeeId == null) {
            shift.setEmployee(null);
            shift.setStatus(ShiftStatus.OPEN);
            return;
        }
        User employee = userService.getById(employeeId);
        shift.setEmployee(employee);
        shift.setStatus(ShiftStatus.ASSIGNED);
    }

    private void validateRange(LocalDateTime start, LocalDateTime end) {
        if (!end.isAfter(start)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Shift end time must be after start time");
        }
    }
}
