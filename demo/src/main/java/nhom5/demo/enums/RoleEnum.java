package nhom5.demo.enums;

import java.util.Set;

/**
 * Enum định nghĩa vai trò người dùng trong hệ thống.
 */
public enum RoleEnum {
    ROLE_USER(Set.of(
            "view:products",
            "view:categories",
            "view:farms",
            "manage:cart",
            "manage:profile"
    )),
    ROLE_ADMIN(Set.of(
            "view:products",
            "manage:products",
            "manage:categories",
            "manage:farms",
            "manage:orders",
            "manage:users",
            "manage:batches",
            "manage:reviews",
            "view:reports",
            "manage:newsletters"
    )),
    ROLE_STAFF(Set.of(
            "view:products",
            "view:categories",
            "view:farms",
            "view:batches",
            "manage:orders",
            "manage:newsletters",
            "manage:profile"
    ));

    private final Set<String> permissions;

    RoleEnum(Set<String> permissions) {
        this.permissions = permissions;
    }

    public Set<String> getPermissions() {
        return permissions;
    }
}
