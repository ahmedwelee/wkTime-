package com.wktime.api.schedule;

import com.wktime.api.user.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
    private final ShiftService shiftService;
    private final UserService userService;

    public ShiftController(ShiftService shiftService, UserService userService) {
        this.shiftService = shiftService;
        this.userService = userService;
    }

    @GetMapping("/mine")
    public List<ShiftDtos.ShiftView> mine() {
        return shiftService.listMine(userService.getCurrentUser()).stream().map(ShiftDtos.ShiftView::from).toList();
    }

    @GetMapping
    // Allow both admins and employees to view all shifts
    public List<ShiftDtos.ShiftView> all() {
        return shiftService.listAll().stream().map(ShiftDtos.ShiftView::from).toList();
    }

    @GetMapping("/open")
    public List<ShiftDtos.ShiftView> open() {
        return shiftService.listOpen().stream().map(ShiftDtos.ShiftView::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ShiftDtos.ShiftView create(@Valid @RequestBody ShiftDtos.ShiftUpsertRequest request) {
        return ShiftDtos.ShiftView.from(shiftService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ShiftDtos.ShiftView update(@PathVariable Long id, @Valid @RequestBody ShiftDtos.ShiftUpsertRequest request) {
        return ShiftDtos.ShiftView.from(shiftService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> delete(@PathVariable Long id) {
        shiftService.delete(id);
        return Map.of("message", "Shift deleted");
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ShiftDtos.ShiftView publish(@PathVariable Long id) {
        return ShiftDtos.ShiftView.from(shiftService.publish(id));
    }

    @PostMapping("/{id}/request-cover")
    public ShiftDtos.ShiftView requestCover(@PathVariable Long id) {
        return ShiftDtos.ShiftView.from(shiftService.requestCover(id, userService.getCurrentUser()));
    }
}
