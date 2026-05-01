package com.wktime.api.availability;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;

public class AvailabilityDtos {
    public record AvailabilitySlotRequest(
            @Min(1) @Max(7) int dayOfWeek,
            @NotBlank String shiftCode
    ) {}

    public record AvailabilitySubmitRequest(
            List<@Valid AvailabilitySlotRequest> slots
    ) {}

    public record AvailabilitySlotView(
            Long id,
            Long userId,
            String employeeName,
            int dayOfWeek,
            String shiftCode,
            LocalDateTime updatedAt
    ) {
        public static AvailabilitySlotView from(AvailabilityEntry entry) {
            return new AvailabilitySlotView(
                    entry.getId(),
                    entry.getUser().getId(),
                    entry.getUser().getFullName(),
                    entry.getDayOfWeek(),
                    entry.getShiftCode(),
                    entry.getUpdatedAt()
            );
        }
    }
}
