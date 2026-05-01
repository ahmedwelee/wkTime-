package com.wktime.api.schedule;

import com.wktime.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByEmployeeOrderByStartAtAsc(User employee);
    List<Shift> findAllByOrderByStartAtAsc();
    List<Shift> findByStatusOrderByStartAtAsc(ShiftStatus status);
}
