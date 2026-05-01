package com.wktime.api.availability;

import com.wktime.api.common.ApiException;
import com.wktime.api.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class AvailabilityService {
    private static final Set<String> ALLOWED_SHIFT_CODES = Set.of("SHIFT_1", "SHIFT_2", "SHIFT_3", "SHIFT_4");

    private final AvailabilityRepository availabilityRepository;

    public AvailabilityService(AvailabilityRepository availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    public List<AvailabilityEntry> listMine(User user) {
        return availabilityRepository.findByUserOrderByDayOfWeekAscShiftCodeAsc(user);
    }

    public List<AvailabilityEntry> listAll() {
        return availabilityRepository.findAllByOrderByUser_FullNameAscDayOfWeekAscShiftCodeAsc();
    }

    @Transactional
    public List<AvailabilityEntry> replaceForUser(User user, AvailabilityDtos.AvailabilitySubmitRequest request) {
        availabilityRepository.deleteByUser(user);
        List<AvailabilityEntry> entries = (request.slots() == null ? Collections.<AvailabilityDtos.AvailabilitySlotRequest>emptyList() : request.slots()).stream()
                .map(slot -> toEntry(user, slot))
                .toList();
        return availabilityRepository.saveAll(entries);
    }

    private AvailabilityEntry toEntry(User user, AvailabilityDtos.AvailabilitySlotRequest slot) {
        if (!ALLOWED_SHIFT_CODES.contains(slot.shiftCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported shift code: " + slot.shiftCode());
        }
        AvailabilityEntry entry = new AvailabilityEntry();
        entry.setUser(user);
        entry.setDayOfWeek(slot.dayOfWeek());
        entry.setShiftCode(slot.shiftCode());
        entry.setUpdatedAt(LocalDateTime.now());
        return entry;
    }
}
