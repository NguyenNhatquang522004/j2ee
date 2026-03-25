package nhom5.demo.repository;

import nhom5.demo.entity.Farm;
import nhom5.demo.enums.CertificationEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findByIsActiveTrue();

    Page<Farm> findByIsActiveTrue(Pageable pageable);

    List<Farm> findByCertification(CertificationEnum certification);

    List<Farm> findByNameContainingIgnoreCase(String name);

    Page<Farm> findByNameContainingIgnoreCase(String name, Pageable pageable);

    boolean existsByName(String name);
}
