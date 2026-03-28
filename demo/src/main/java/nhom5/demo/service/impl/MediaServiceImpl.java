package nhom5.demo.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.MediaResponse;
import nhom5.demo.entity.Media;
import nhom5.demo.repository.MediaRepository;
import nhom5.demo.service.MediaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final Cloudinary cloudinary;
    private final MediaRepository mediaRepository;

    @Override
    @Transactional
    public MediaResponse uploadFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new RuntimeException("Chỉ chấp nhận file hình ảnh hoặc video");
        }

        String resourceType = "auto";
        if (contentType.startsWith("video")) {
            resourceType = "video";
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap("resource_type", resourceType));

        Media media = Media.builder()
                .url(uploadResult.get("secure_url").toString())
                .publicId(uploadResult.get("public_id").toString())
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .build();

        Media saved = mediaRepository.save(media);
        return toResponse(saved);
    }

    @Override
    public List<MediaResponse> getAllMedia() {
        return mediaRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteMedia(Long id) throws IOException {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));
        
        String resourceType = media.getFileType() != null && media.getFileType().startsWith("video") ? "video" : "image";
        cloudinary.uploader().destroy(media.getPublicId(), ObjectUtils.asMap("resource_type", resourceType));
        mediaRepository.delete(media);
    }

    private MediaResponse toResponse(Media media) {
        return MediaResponse.builder()
                .id(media.getId())
                .url(media.getUrl())
                .publicId(media.getPublicId())
                .fileName(media.getFileName())
                .fileType(media.getFileType())
                .fileSize(media.getFileSize())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
