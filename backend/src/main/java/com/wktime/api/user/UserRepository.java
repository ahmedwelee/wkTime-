package com.wktime.api.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatus(AccountStatus status);
    List<User> findByRole(Role role);
    List<User> findByRoleAndStatus(Role role, AccountStatus status);
}
