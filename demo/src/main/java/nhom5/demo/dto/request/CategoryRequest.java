package nhom5.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;
    private String slug;
    private String imageUrl;
    private Boolean isActive = true;
}
