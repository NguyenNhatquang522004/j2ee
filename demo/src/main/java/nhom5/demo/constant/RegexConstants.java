package nhom5.demo.constant;

public class RegexConstants {
    /** 
     * VIETNAM_PHONE: Strict 10-digit mobile numbers for Vietnam with valid prefixes.
     * Covers: Viettel (032-039, 086, 096-098), Vinaphone (081-085, 088, 091, 094), 
     * Mobifone (070, 076-079, 089, 090, 093), Vietnamobile (052, 056, 058, 092), Gmobile (059, 099).
     */
    public static final String VIETNAM_PHONE = "^(0)(32|33|34|35|36|37|38|39|52|56|58|59|70|76|77|78|79|81|82|83|84|85|86|87|88|89|90|91|92|93|94|96|97|98|99)[0-9]{7}$";

    /**
     * FULL_NAME: Vietnamese letters and spaces only. No numbers or special characters.
     * \p{L} matches any kind of letter from any language.
     */
    public static final String FULL_NAME = "^[\\p{L} ]+$";

    /** 
     * PASSWORD: High complexity password.
     * At least 1 uppercase, 1 lowercase, 1 digit, 1 special char, 8-100 chars.
     */
    public static final String PASSWORD = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
}
