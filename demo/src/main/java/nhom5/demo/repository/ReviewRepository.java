package nhom5.demo.repository;

import nhom5.demo.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import nhom5.demo.enums.ReviewStatusEnum;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user " +
           "WHERE r.product.id = :productId " +
           "AND (:rating IS NULL OR r.rating = :rating) " +
           "AND (r.status = :status OR (r.user.username = :viewerUsername AND r.status != 'REJECTED')) " +
           "ORDER BY r.createdAt DESC")
    Page<Review> findByProductIdAndRating(
            @Param("productId") Long productId, 
            @Param("status") ReviewStatusEnum status, 
            @Param("viewerUsername") String viewerUsername,
            @Param("rating") Integer rating, 
            Pageable pageable);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.product ORDER BY r.createdAt DESC")
    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    boolean existsByProductIdAndUserIdAndStatusIsNot(Long productId, Long userId, nhom5.demo.enums.ReviewStatusEnum status);

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);
}
