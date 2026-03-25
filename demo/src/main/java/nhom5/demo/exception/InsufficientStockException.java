package nhom5.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String productName, int requested, int available) {
        super(String.format("Sản phẩm '%s' không đủ tồn kho. Yêu cầu: %d, Còn lại: %d",
                productName, requested, available));
    }

    public InsufficientStockException(String message) {
        super(message);
    }
}
