package nhom5.demo.repository;

import nhom5.demo.entity.User;
import nhom5.demo.enums.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    org.springframework.data.domain.Page<User> findByRoleIn(java.util.Collection<RoleEnum> roles, org.springframework.data.domain.Pageable pageable);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByRole(RoleEnum role);

    Optional<User> findByResetToken(String token);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
