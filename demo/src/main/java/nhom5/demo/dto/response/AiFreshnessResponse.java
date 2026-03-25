package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AiFreshnessResponse {
    private String result;
    /** e.g. FRESH, GOOD, FAIR, POOR, SPOILED, UNKNOWN */
    private String label;
    /** Alias for label — used by frontend freshness display */
    private String freshness;
    private Double confidence;
    private String message;
    /** Narrative description of the analysis */
    private String description;
    /** User-facing suggestion */
    private String suggestion;
    private boolean isFresh;
}
