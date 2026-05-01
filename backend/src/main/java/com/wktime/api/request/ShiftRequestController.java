package com.wktime.api.request;

import com.wktime.api.user.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shift-requests")
public class ShiftRequestController {
    private final ShiftRequestService shiftRequestService;
    private final UserService userService;

    public ShiftRequestController(ShiftRequestService shiftRequestService, UserService userService) {
        this.shiftRequestService = shiftRequestService;
        this.userService = userService;
    }

    @GetMapping("/mine")
    public List<ShiftRequestDtos.ShiftRequestView> mine() {
        return shiftRequestService.listMine(userService.getCurrentUser()).stream()
                .map(ShiftRequestDtos.ShiftRequestView::from)
                .toList();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ShiftRequestDtos.ShiftRequestView> pending() {
        return shiftRequestService.listPending().stream()
                .map(ShiftRequestDtos.ShiftRequestView::from)
                .toList();
    }

    @PostMapping("/{shiftId}/take")
    public ShiftRequestDtos.ShiftRequestView takeShift(@PathVariable Long shiftId, @Valid @RequestBody ShiftRequestDtos.TakeShiftRequest request) {
        return ShiftRequestDtos.ShiftRequestView.from(
                shiftRequestService.takeShift(shiftId, userService.getCurrentUser(), request.message())
        );
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ShiftRequestDtos.ShiftRequestView approve(@PathVariable Long id) {
        return ShiftRequestDtos.ShiftRequestView.from(shiftRequestService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ShiftRequestDtos.ShiftRequestView reject(@PathVariable Long id) {
        return ShiftRequestDtos.ShiftRequestView.from(shiftRequestService.reject(id));
    }
}
