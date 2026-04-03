package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.MediaResponse;
import nhom5.demo.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

/**
 * REST CONTROLLER: MediaController
 * ---------------------------------------------------------
 * Centralized hub for digital asset management (Images & Videos).
 * Directly interfaces with the Cloudinary storage provider for scalable resource delivery.
 * 
 * Capabilities:
 * - Public/Authenticated: Secure file uploads for profiles/reviews.
 * - Admin: Full library oversight, including permanent deletion of cloud-hosted assets.
 */
@Tag(name = "Media", description = "Quản lý thư viện ảnh và video (Cloudinary)")
@RestController
@RequestMapping(AppConstants.API_BASE + "/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /**
     * uploadFile: Streams a raw file to the cloud storage service.
     * Returns a persistent URL and public ID for database registration.
     * @throws IOException if the network stream to the cloud provider is interrupted.
     */
    @Operation(summary = "Tải ảnh/video lên Cloudinary")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadFile(
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(mediaService.uploadFile(Objects.requireNonNull(file))));
    }

    /**
     * getAllMedia: Administrative catalog of all assets currently managed by the application.
     */
    @Operation(summary = "Lấy danh sách tất cả file trong thư viện")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'view:media', 'manage:media')")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> getAllMedia() {
        return ResponseEntity.ok(ApiResponse.success(mediaService.getAllMedia()));
    }

    /**
     * deleteMedia: Safely unregisters an asset from the local DB and triggers a delete command on Cloudinary.
     * @throws IOException if the cloud provider API rejects the removal request.
     */
    @Operation(summary = "Xóa file khỏi thư viện và Cloudinary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:media')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable Long id) throws IOException {
        mediaService.deleteMedia(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }
}
