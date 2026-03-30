package nhom5.demo.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

public class SecurityUtils {
    public static String getCurrentUsername() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    public static boolean hasAnyRole(String... roles) {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return false;
        }
        Collection<? extends GrantedAuthority> authorities = 
            SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        
        for (String role : roles) {
            String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            for (GrantedAuthority authority : authorities) {
                if (authority.getAuthority().equals(roleWithPrefix)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static String sanitize(String html) {
        if (html == null) return null;
        return org.jsoup.Jsoup.clean(html, org.jsoup.safety.Safelist.relaxed());
    }
}
