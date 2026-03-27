package nhom5.demo.service;

import nhom5.demo.dto.response.MediaResponse;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface MediaService {
    MediaResponse uploadFile(MultipartFile file) throws IOException;
    List<MediaResponse> getAllMedia();
    void deleteMedia(Long id) throws IOException;
}
