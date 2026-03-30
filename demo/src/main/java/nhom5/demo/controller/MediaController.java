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

@Tag(name = "Media", description = "Quản lý thư viện ảnh và video (Cloudinary)")
@RestController
@RequestMapping(AppConstants.API_BASE + "/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @Operation(summary = "Tải ảnh/video lên Cloudinary")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadFile(
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(mediaService.uploadFile(file)));
    }

    @Operation(summary = "Lấy danh sách tất cả file trong thư viện")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> getAllMedia() {
        return ResponseEntity.ok(ApiResponse.success(mediaService.getAllMedia()));
    }

    @Operation(summary = "Xóa file khỏi thư viện và Cloudinary")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable Long id) throws IOException {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }
}
