package nhom5.demo.repository;

import nhom5.demo.entity.User;
import nhom5.demo.enums.RoleEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Page<User> findByRoleIn(java.util.Collection<RoleEnum> roles, Pageable pageable);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    @Query("SELECT u FROM User u WHERE " +
           "(:query IS NULL OR u.username LIKE %:query% OR u.fullName LIKE %:query% OR u.email LIKE %:query%) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> searchUsers(@Param("query") String query, 
                          @Param("role") nhom5.demo.enums.RoleEnum role, 
                          @Param("isActive") Boolean isActive, 
                          Pageable pageable);

    long countByRole(RoleEnum role);

    Optional<User> findByResetToken(String token);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
