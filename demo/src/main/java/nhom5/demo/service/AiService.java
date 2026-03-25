package nhom5.demo.service;

import nhom5.demo.dto.response.AiFreshnessResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AiService {
    AiFreshnessResponse analyzeFreshness(MultipartFile imageFile);
}
