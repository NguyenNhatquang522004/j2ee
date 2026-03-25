package nhom5.demo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.*;
import nhom5.demo.enums.BatchStatusEnum;
import nhom5.demo.enums.CertificationEnum;
import nhom5.demo.enums.RoleEnum;
import nhom5.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Dữ liệu đã tồn tại, bỏ qua bước khởi tạo.");
            return;
        }

        log.info("=== Bắt đầu khởi tạo dữ liệu mẫu cho hệ thống Thực Phẩm Sạch ===");

        // 1. Tạo Users
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Quản trị viên Hệ thống")
                .email("admin@cleanfood.com")
                .phone("0988888888")
                .role(RoleEnum.ROLE_ADMIN)
                .isActive(true)
                .build();

        User user = User.builder()
                .username("user")
                .password(passwordEncoder.encode("user123"))
                .fullName("Nguyễn Văn Khách")
                .email("user@gmail.com")
                .phone("0912345678")
                .role(RoleEnum.ROLE_USER)
                .isActive(true)
                .build();

        userRepository.saveAll(Arrays.asList(admin, user));
        log.info("Đã tạo user mẫu: admin/admin123 và user/user123");

        // 2. Tạo Categories
        Category rau = Category.builder().name("Rau sạch").description("Các loại rau lá tươi ngon").build();
        Category cuQua = Category.builder().name("Củ quả").description("Các loại củ và quả thực phẩm").build();
        Category traiCay = Category.builder().name("Trái cây tươi").description("Trái cây đặc sản vùng miền").build();
        Category thit = Category.builder().name("Thịt sạch").description("Thịt gia súc, gia cầm tươi sống").build();

        categoryRepository.saveAll(Arrays.asList(rau, cuQua, traiCay, thit));

        // 3. Tạo Farms
        Farm dalatFarm = Farm.builder()
                .name("Nông trại Đà Lạt sạch")
                .address("123 Đường Mai Anh Đào, Phường 8")
                .province("Lâm Đồng")
                .certification(CertificationEnum.VIETGAP)
                .certificationCode("VG-DL-2024-001")
                .description("Chuyên cung cấp rau củ đạt chuẩn VietGAP tại Đà Lạt.")
                .build();

        Farm baviFarm = Farm.builder()
                .name("Trang trại Ba Vì Organic")
                .address("Xã Tản Lĩnh, Huyện Ba Vì")
                .province("Hà Nội")
                .certification(CertificationEnum.ORGANIC)
                .certificationCode("OR-BV-2024-055")
                .description("Trang trại nông nghiệp hữu cơ lớn nhất khu vực miền Bắc.")
                .build();

        farmRepository.saveAll(Arrays.asList(dalatFarm, baviFarm));

        // 4. Tạo Products
        Product supLo = Product.builder()
                .name("Súp lơ xanh Đà Lạt")
                .description("Súp lơ tươi mới, không thuốc trừ sâu.")
                .price(new BigDecimal("35000"))
                .unit("Cái")
                .imageUrl("https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2xyL3Y4NjgtYmF0Y2gxLTA0LmpwZw.jpg")
                .category(rau)
                .farm(dalatFarm)
                .build();

        Product chuoi = Product.builder()
                .name("Chuối tiêu hồng")
                .description("Chuối ngọt, thơm, giàu dinh dưỡng.")
                .price(new BigDecimal("25000"))
                .unit("Nải")
                .imageUrl("https://vcdn1-giadinh.vnecdn.net/2021/04/09/chuoi-6754-1617942186.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=I3oR0O5LAn_m9rAHzvK2wA")
                .category(traiCay)
                .farm(baviFarm)
                .build();

        Product thitHeo = Product.builder()
                .name("Thịt ba chỉ CP")
                .description("Thịt heo sạch, nuôi theo tiêu chuẩn an toàn.")
                .price(new BigDecimal("150000"))
                .unit("Kg")
                .imageUrl("https://thucphamsachcp.vn/wp-content/uploads/2022/03/thit-ba-chi-heo.jpg")
                .category(thit)
                .farm(dalatFarm)
                .build();

        productRepository.saveAll(Arrays.asList(supLo, chuoi, thitHeo));

        // 5. Tạo Batches (Để có tồn kho)
        createBatch(supLo, "BATCH-SL-001", 100, 5); // Lô tươi
        createBatch(supLo, "BATCH-SL-002", 50, -1);  // Lô đã hết hạn để test Scheduler
        
        createBatch(chuoi, "BATCH-CH-001", 80, 7);  // Lô tươi
        createBatch(chuoi, "BATCH-CH-002", 40, 2);  // Lô sắp hết hạn (Sẽ bị DISCOUNT)

        createBatch(thitHeo, "BATCH-TH-001", 60, 3); // Lô sắp hết hạn

        log.info("=== Khởi tạo dữ liệu mẫu hoàn tất! ===");
    }

    private void createBatch(Product product, String code, int qty, int daysToExpiry) {
        ProductBatch batch = ProductBatch.builder()
                .batchCode(code)
                .product(product)
                .importDate(LocalDate.now())
                .productionDate(LocalDate.now().minusDays(2))
                .expiryDate(LocalDate.now().plusDays(daysToExpiry))
                .quantity(qty)
                .remainingQuantity(qty)
                .status(BatchStatusEnum.ACTIVE)
                .build();
        batchRepository.save(batch);
    }
}
