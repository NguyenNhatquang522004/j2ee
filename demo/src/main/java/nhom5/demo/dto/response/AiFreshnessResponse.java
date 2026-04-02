package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    @JsonProperty("isFresh")
    private boolean isFresh;
}
