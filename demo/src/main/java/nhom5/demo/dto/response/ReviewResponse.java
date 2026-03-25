package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long productId;
    private String productName;
    private Long userId;
    private String username;
    private String userFullName;
    private LocalDateTime createdAt;
}
