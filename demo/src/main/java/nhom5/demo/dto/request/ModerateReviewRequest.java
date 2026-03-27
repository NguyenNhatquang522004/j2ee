package nhom5.demo.dto.request;

import lombok.Data;
import nhom5.demo.enums.ReviewStatusEnum;

@Data
public class ModerateReviewRequest {
    private ReviewStatusEnum status;
    private String adminReply;
}
