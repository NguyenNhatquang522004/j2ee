package nhom5.demo.dto.request;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SepayWebhookRequest {
    private String id;
    private String bank_brand_name;
    private String account_number;
    private String transaction_date;
    private BigDecimal amount_in;
    private BigDecimal amount_out;
    private BigDecimal accumulated_balance;
    private String content; // Nội dung chuyển khoản
    private String reference_number;
    private String code;
    private String sub_account;
}
