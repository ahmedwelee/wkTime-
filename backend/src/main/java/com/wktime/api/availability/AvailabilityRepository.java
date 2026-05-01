package com.wktime.api.availability;

import com.wktime.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvailabilityRepository extends JpaRepository<AvailabilityEntry, Long> {
    List<AvailabilityEntry> findByUserOrderByDayOfWeekAscShiftCodeAsc(User user);
    List<AvailabilityEntry> findAllByOrderByUser_FullNameAscDayOfWeekAscShiftCodeAsc();
    void deleteByUser(User user);
}
