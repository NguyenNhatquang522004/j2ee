package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long productId;
    private String productName;
    private Long userId;
    private String username;
    private String userFullName;
    private String userAvatarUrl;
    private java.util.List<MediaResponse> media;
    private String adminReply;
    private nhom5.demo.enums.ReviewStatusEnum status;
    private LocalDateTime createdAt;
}
