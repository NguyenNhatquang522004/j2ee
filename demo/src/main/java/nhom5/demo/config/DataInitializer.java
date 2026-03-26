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

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository batchRepository;
    private final AddressRepository addressRepository;
    private final SystemSettingRepository settingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Bắt đầu khởi tạo dữ liệu mẫu cho hệ thống Thực Phẩm Sạch ===");

        if (settingRepository.count() == 0) {
            seedSystemSettings();
        }

        if (userRepository.count() == 0) {
            seedUsersAndAddresses();
        } else if (addressRepository.count() == 0) {
            seedOnlyAddresses();
        }

        if (productRepository.count() < 10) {
            seedProductsAndCategories();
        }

        // Luôn đảm bảo tắt bảo trì khi khởi động hệ thống
        SystemSetting maintenance = settingRepository.findBySettingKey("MAINTENANCE_MODE")
                .orElse(SystemSetting.builder().settingKey("MAINTENANCE_MODE").build());
        maintenance.setSettingValue("false");
        maintenance.setDescription("Bật/tắt chế độ bảo trì toàn hệ thống");
        settingRepository.save(maintenance);

        log.info("=== Khởi tạo dữ liệu mẫu hoàn tất! ===");
    }

    private void seedSystemSettings() {
        SystemSetting maintenance = SystemSetting.builder()
                .settingKey("MAINTENANCE_MODE")
                .settingValue("false")
                .description("Bật/tắt chế độ bảo trì toàn hệ thống")
                .build();

        SystemSetting twoFactor = SystemSetting.builder()
                .settingKey("2FA_ENFORCED")
                .settingValue("false")
                .description("Bắt buộc xác thực 2 bước cho tất cả Admin")
                .build();

        settingRepository.saveAll(Arrays.asList(maintenance, twoFactor));
        log.info("Đã tạo các cài đặt hệ thống mặc định.");
    }

    private void seedUsersAndAddresses() {
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

        Address addr1 = Address.builder()
                .label("Nhà")
                .fullName("Nguyễn Văn Khách")
                .phone("0912345678")
                .details("Số 12, Ngõ 34, Đường Láng, Quận Đống Đa, Hà Nội")
                .isDefault(true)
                .user(user)
                .build();

        Address addr2 = Address.builder()
                .label("Công ty")
                .fullName("Khách (Văn phòng)")
                .phone("0912345678")
                .details("Tầng 15, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội")
                .isDefault(false)
                .user(user)
                .build();

        addressRepository.saveAll(Arrays.asList(addr1, addr2));
        log.info("Đã tạo 2 địa chỉ cho 'user'");
    }

    private void seedOnlyAddresses() {
        userRepository.findByUsername("user").ifPresent(user -> {
            Address addr1 = Address.builder()
                    .label("Nhà")
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .details("Số 12, Ngõ 34, Đường Láng, Quận Đống Đa, Hà Nội")
                    .isDefault(true)
                    .user(user)
                    .build();
            Address addr2 = Address.builder()
                    .label("Công ty")
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .details("Tầng 15, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội")
                    .isDefault(false)
                    .user(user)
                    .build();
            addressRepository.saveAll(Arrays.asList(addr1, addr2));
            log.info("Đã bổ sung địa chỉ mẫu cho 'user'");
        });
    }

    private void seedProductsAndCategories() {
        // Categories
        Category rauCu = Category.builder().name("Rau củ quả").description("Rau tươi sạch mỗi ngày").build();
        Category traiCay = Category.builder().name("Trái cây").description("Trái cây hữu cơ nhập khẩu & nội địa").build();
        Category thit = Category.builder().name("Thịt & Hải sản").description("Thịt sạch, cá tươi sống").build();
        Category doKho = Category.builder().name("Đồ khô & Gia vị").description("Gia vị, gạo sạch").build();
        categoryRepository.saveAll(Arrays.asList(rauCu, traiCay, thit, doKho));

        // Farms
        Farm dalat = Farm.builder()
                .name("Green Valley Farm")
                .province("Đà Lạt")
                .address("123 Đèo Prenn")
                .certification(CertificationEnum.VIETGAP)
                .isActive(true)
                .build();
        Farm hoabinh = Farm.builder()
                .name("Organic Hill")
                .province("Hòa Bình")
                .address("456 Lương Sơn")
                .certification(CertificationEnum.GLOBAL_GAP)
                .isActive(true)
                .build();
        Farm tiengiang = Farm.builder()
                .name("Sunny Meadow")
                .province("Tiền Giang")
                .address("789 Cai Lậy")
                .certification(CertificationEnum.ORGANIC)
                .isActive(true)
                .build();
        farmRepository.saveAll(Arrays.asList(dalat, hoabinh, tiengiang));

        // 30 Products
        productRepository.saveAll(Arrays.asList(
                // Rau củ
                p("Rau muống xanh", 15000, 20000, "Bó", rauCu, dalat, "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=500&q=80", true),
                p("Cải bó xôi Đà Lạt", 35000, 45000, "Kg", rauCu, dalat, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80", true),
                p("Cà chua bi hữu cơ", 45000, 60000, "Hộp 500g", rauCu, dalat, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80", true),
                p("Cà rốt baby", 25000, 30000, "Bó", rauCu, hoabinh, "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=500&q=80", false),
                p("Súp lơ xanh", 30000, 0, "Cây", rauCu, dalat, "https://images.unsplash.com/photo-1452948491233-ad8a1ed01085?auto=format&fit=crop&w=500&q=80", false),
                p("Khoai tây vàng", 20000, 0, "Kg", rauCu, hoabinh, "https://images.unsplash.com/photo-1518977676601-b53f02bad675?auto=format&fit=crop&w=500&q=80", false),
                p("Hành tây tím", 22000, 28000, "Kg", rauCu, tiengiang, "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=500&q=80", false),
                p("Bí ngòi xanh", 28000, 0, "Kg", rauCu, dalat, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80", false),
                
                // Trái cây
                p("Táo Mỹ Envy", 120000, 150000, "Kg", traiCay, dalat, "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=500&q=80", true),
                p("Cam sành hữu cơ", 55000, 65000, "Kg", traiCay, tiengiang, "https://images.unsplash.com/photo-1582281298055-e25b84a30b44?auto=format&fit=crop&w=500&q=80", false),
                p("Dưa lưới tròn", 85000, 100000, "Trái", traiCay, tiengiang, "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=500&q=80", true),
                p("Bưởi da xanh", 65000, 0, "Kg", traiCay, tiengiang, "https://images.unsplash.com/photo-1550506389-cf2a4a32c021?auto=format&fit=crop&w=500&q=80", false),
                p("Xoài cát Hòa Lộc", 75000, 90000, "Kg", traiCay, tiengiang, "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80", false),
                p("Chuối sứ chín cây", 18000, 0, "Nải", traiCay, hoabinh, "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80", false),
                p("Dâu tây Đà Lạt", 150000, 200000, "Hộp 500g", traiCay, dalat, "https://images.unsplash.com/photo-1464965211904-c72145fd73f6?auto=format&fit=crop&w=500&q=80", true),
                p("Nho đen không hạt", 180000, 0, "Kg", traiCay, tiengiang, "https://images.unsplash.com/photo-1537084642907-629340c7e59c?auto=format&fit=crop&w=500&q=80", false),

                // Thịt & Hải sản
                p("Thịt ba rọi sạch", 165000, 185000, "Kg", thit, hoabinh, "https://images.unsplash.com/photo-1602470520998-f4a5cd55f2c1?auto=format&fit=crop&w=500&q=80", true),
                p("Thịt bò thăn nội", 380000, 420000, "Kg", thit, hoabinh, "https://images.unsplash.com/photo-1544022613-e87f75a784a5?auto=format&fit=crop&w=500&q=80", false),
                p("Gà ta thả vườn", 220000, 250000, "Con", thit, hoabinh, "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=80", false),
                p("Trứng gà hữu cơ", 4500, 5000, "Quả", thit, hoabinh, "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=500&q=80", true),
                p("Cá hồi Na Uy phi lê", 550000, 600000, "Kg", thit, hoabinh, "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=500&q=80", false),
                p("Tôm sú tươi sống", 320000, 0, "Kg", thit, tiengiang, "https://images.unsplash.com/photo-1559742811-0e10e6e76161?auto=format&fit=crop&w=500&q=80", false),
                
                // Đồ khô & Gia vị
                p("Gạo ST25 chuẩn vị", 35000, 40000, "Kg", doKho, tiengiang, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80", true),
                p("Mật ong rừng nguyên chất", 250000, 300000, "Chai 500ml", doKho, hoabinh, "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=500&q=80", false),
                p("Nước mắm nhỉ", 95000, 110000, "Chai", doKho, tiengiang, "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=500&q=80", false),
                p("Hạt điều rang muối", 185000, 220000, "Hộp 500g", doKho, hoabinh, "https://images.unsplash.com/photo-1509144670474-5c3cd5859f7e?auto=format&fit=crop&w=500&q=80", false),
                p("Ớt bột sạch", 15000, 0, "Gói", doKho, dalat, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80", false),
                p("Tiêu đen Đắk Lắk", 120000, 0, "Kg", doKho, tiengiang, "https://images.unsplash.com/photo-1599819177371-04a71ac1a0ad?auto=format&fit=crop&w=500&q=80", false),
                p("Đậu xanh hữu cơ", 45000, 50000, "Kg", doKho, hoabinh, "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&w=500&q=80", false),
                p("Nấm hương rừng", 60000, 0, "Gói 100g", doKho, hoabinh, "https://images.unsplash.com/photo-1574041164913-731383569420?auto=format&fit=crop&w=500&q=80", false)
        ));
    }

    private Product p(String name, double price, double oldPrice, String unit, Category cat, Farm farm, String img, boolean isNew) {
        return Product.builder()
                .name(name)
                .description("Sản phẩm " + name + " sạch, an toàn cho sức khỏe từ " + farm.getName())
                .price(BigDecimal.valueOf(price))
                .originalPrice(oldPrice > 0 ? BigDecimal.valueOf(oldPrice) : null)
                .unit(unit)
                .imageUrl(img)
                .category(cat)
                .farm(farm)
                .isActive(true)
                .isNew(isNew)
                .build();
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
