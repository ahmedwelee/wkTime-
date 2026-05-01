package com.wktime.api.request;

import com.wktime.api.schedule.ShiftDtos;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class ShiftRequestDtos {
    public record TakeShiftRequest(@NotBlank String message) {}

    public record ShiftRequestView(
            Long id,
            ShiftDtos.ShiftView shift,
            Long requesterId,
            String requesterName,
            String status,
            String message,
            LocalDateTime createdAt
    ) {
        public static ShiftRequestView from(ShiftRequest shiftRequest) {
            return new ShiftRequestView(
                    shiftRequest.getId(),
                    ShiftDtos.ShiftView.from(shiftRequest.getShift()),
                    shiftRequest.getRequester().getId(),
                    shiftRequest.getRequester().getFullName(),
                    shiftRequest.getStatus().name(),
                    shiftRequest.getMessage(),
                    shiftRequest.getCreatedAt()
            );
        }
    }
}
