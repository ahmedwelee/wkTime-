package com.wktime.api.config;

import com.wktime.api.user.AccountStatus;
import com.wktime.api.user.Role;
import com.wktime.api.user.User;
import com.wktime.api.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@wktime.local").isEmpty()) {
            User admin = new User();
            admin.setFullName("WK Time Admin");
            admin.setEmail("admin@wktime.local");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(AccountStatus.ACTIVE);
            userRepository.save(admin);
        }

        User employee;
        if (userRepository.findByEmail("employee@wktime.local").isEmpty()) {
            employee = new User();
            employee.setFullName("WK Time Employee");
            employee.setEmail("employee@wktime.local");
            employee.setPasswordHash(passwordEncoder.encode("Employee@123"));
            employee.setRole(Role.EMPLOYEE);
            employee.setStatus(AccountStatus.ACTIVE);
            userRepository.save(employee);
        } else {
            employee = userRepository.findByEmail("employee@wktime.local").get();
        }
    }
}
