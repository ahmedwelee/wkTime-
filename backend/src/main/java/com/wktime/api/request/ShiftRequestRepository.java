package com.wktime.api.request;

import com.wktime.api.schedule.Shift;
import com.wktime.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShiftRequestRepository extends JpaRepository<ShiftRequest, Long> {
    List<ShiftRequest> findByRequesterOrderByCreatedAtDesc(User requester);
    List<ShiftRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);
    List<ShiftRequest> findByShiftOrderByCreatedAtDesc(Shift shift);
}

