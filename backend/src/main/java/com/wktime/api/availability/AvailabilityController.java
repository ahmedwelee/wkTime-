package com.wktime.api.availability;

import com.wktime.api.user.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {
    private final AvailabilityService availabilityService;
    private final UserService userService;

    public AvailabilityController(AvailabilityService availabilityService, UserService userService) {
        this.availabilityService = availabilityService;
        this.userService = userService;
    }

    @GetMapping("/mine")
    public List<AvailabilityDtos.AvailabilitySlotView> mine() {
        return availabilityService.listMine(userService.getCurrentUser()).stream()
                .map(AvailabilityDtos.AvailabilitySlotView::from)
                .toList();
    }

    @PostMapping("/mine")
    public List<AvailabilityDtos.AvailabilitySlotView> saveMine(@Valid @RequestBody AvailabilityDtos.AvailabilitySubmitRequest request) {
        return availabilityService.replaceForUser(userService.getCurrentUser(), request).stream()
                .map(AvailabilityDtos.AvailabilitySlotView::from)
                .toList();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AvailabilityDtos.AvailabilitySlotView> all() {
        return availabilityService.listAll().stream()
                .map(AvailabilityDtos.AvailabilitySlotView::from)
                .toList();
    }
}

