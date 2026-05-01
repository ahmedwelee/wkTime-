package com.wktime.api.schedule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ShiftDtos {
    public record ShiftUpsertRequest(
            @NotBlank String title,
            @NotNull LocalDateTime startAt,
            @NotNull LocalDateTime endAt,
            String notes,
            Long employeeId,
            boolean published
    ) {}

    public record ShiftView(
            Long id,
            String title,
            LocalDateTime startAt,
            LocalDateTime endAt,
            String notes,
            Long employeeId,
            String employeeName,
            String status,
            boolean published,
            LocalDateTime updatedAt
    ) {
        public static ShiftView from(Shift shift) {
            return new ShiftView(
                    shift.getId(),
                    shift.getTitle(),
                    shift.getStartAt(),
                    shift.getEndAt(),
                    shift.getNotes(),
                    shift.getEmployee() != null ? shift.getEmployee().getId() : null,
                    shift.getEmployee() != null ? shift.getEmployee().getFullName() : "Open Shift",
                    shift.getStatus().name(),
                    shift.isPublished(),
                    shift.getUpdatedAt()
            );
        }
    }
}
