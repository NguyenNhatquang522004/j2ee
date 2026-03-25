package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AiFreshnessResponse {
    private String result;
    private String label;
    private Double confidence;
    private String message;
    private boolean isFresh;
}
