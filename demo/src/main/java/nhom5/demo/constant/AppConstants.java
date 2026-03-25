package nhom5.demo.constant;

/**
 * Hằng số dùng chung toàn hệ thống.
 * Tránh hardcode string/number rải rác trong code.
 */
public final class AppConstants {

    private AppConstants() {
    }

    // ====== JWT ======
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";

    // ====== PAGINATION ======
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "asc";

    // ====== ROLES ======
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_USER = "ROLE_USER";

    // ====== API PATHS ======
    public static final String API_BASE = "/api/v1";
    public static final String AUTH_PATH = API_BASE + "/auth";
    public static final String PRODUCT_PATH = API_BASE + "/products";
    public static final String CATEGORY_PATH = API_BASE + "/categories";
    public static final String FARM_PATH = API_BASE + "/farms";
    public static final String ORDER_PATH = API_BASE + "/orders";
    public static final String CART_PATH = API_BASE + "/cart";
    public static final String REVIEW_PATH = API_BASE + "/reviews";
    public static final String BATCH_PATH = API_BASE + "/batches";
    public static final String AI_PATH = API_BASE + "/ai";
    public static final String DASHBOARD_PATH = API_BASE + "/dashboard";
    public static final String USER_PATH = API_BASE + "/users";

    // ====== BATCH MANAGEMENT ======
    public static final int DEFAULT_EXPIRY_WARNING_DAYS = 3;

    // ====== EMAIL ======
    public static final String MAIL_ORDER_TEMPLATE = "email-order-confirmation";
    public static final String MAIL_COUPON_TEMPLATE = "email-coupon-notification";
}
