package com.billpro.config;

import com.billpro.business.Business;
import com.billpro.business.BusinessRepository;
import com.billpro.category.Category;
import com.billpro.category.CategoryRepository;
import com.billpro.inventory.Inventory;
import com.billpro.inventory.InventoryRepository;
import com.billpro.printer.Printer;
import com.billpro.printer.PrinterRepository;
import com.billpro.product.Product;
import com.billpro.product.ProductRepository;
import com.billpro.user.Role;
import com.billpro.user.User;
import com.billpro.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PrinterRepository printerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(BusinessRepository businessRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository,
                           PrinterRepository printerRepository,
                           PasswordEncoder passwordEncoder) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.printerRepository = printerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing BillPro SQLite database and checking seed data...");

        // Ensure data directory exists
        try {
            File dataDir = new File("data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
        } catch (Exception e) {
            log.warn("Could not create local data directory: {}", e.getMessage());
        }

        // 1. Seed Business Profile
        Business business;
        Optional<Business> existingBiz = businessRepository.findById(1L);
        if (existingBiz.isPresent()) {
            business = existingBiz.get();
        } else {
            business = Business.builder()
                    .name("12 Inch Fries")
                    .ownerName("Ganesh Shinde")
                    .mobile("9876543210")
                    .email("contact@the12inchfries.com")
                    .address("Kharadi")
                    .city("Pune")
                    .state("Maharashtra")
                    .pincode("411014")
                    .invoicePrefix("INF")
                    .build();
            business = businessRepository.save(business);
            log.info("Created business: {}", business.getName());
        }

        // 2. Seed Admin User with properly hashed password
        String defaultAdminPhone = "9876543210";
        String defaultAdminEmail = "ganesh@the12inchfries.com";
        String defaultPassword = "password123";

        Optional<User> adminOpt = userRepository.findByMobile(defaultAdminPhone);
        if (adminOpt.isEmpty()) {
            adminOpt = userRepository.findByEmail(defaultAdminEmail);
        }

        if (adminOpt.isEmpty()) {
            String hashedPassword = passwordEncoder.encode(defaultPassword);
            User admin = User.builder()
                    .name("Ganesh Shinde")
                    .email(defaultAdminEmail)
                    .mobile(defaultAdminPhone)
                    .password(hashedPassword)
                    .role(Role.OWNER)
                    .businessId(business.getId())
                    .build();
            userRepository.save(admin);
            log.info("Admin user created with mobile: {} and secure BCrypt hashed password.", defaultAdminPhone);
        } else {
            User existingAdmin = adminOpt.get();
            // Verify if password is correctly hashed with BCrypt
            boolean needsRehash = false;
            String currentPassword = existingAdmin.getPassword();
            if (currentPassword == null || !currentPassword.startsWith("$2a$") || currentPassword.contains("...hashed_password")) {
                needsRehash = true;
            } else {
                // If it doesn't match default password and was corrupted dummy data, update it
                try {
                    if (!passwordEncoder.matches(defaultPassword, currentPassword)) {
                        // Check if it's the broken placeholder string
                        if (currentPassword.contains("...")) {
                            needsRehash = true;
                        }
                    }
                } catch (Exception ex) {
                    needsRehash = true;
                }
            }

            if (needsRehash) {
                existingAdmin.setPassword(passwordEncoder.encode(defaultPassword));
                userRepository.save(existingAdmin);
                log.info("Updated admin password for {} to valid BCrypt hash.", defaultAdminPhone);
            }
        }

        // 3. Seed Categories
        Category catSignature = getOrCreateCategory(business.getId(), "Signature Fries");
        Category catSpecial = getOrCreateCategory(business.getId(), "House Special");
        Category catByo = getOrCreateCategory(business.getId(), "Build Your Own");
        Category catAddons = getOrCreateCategory(business.getId(), "Add-Ons");

        // 4. Seed Products and Inventory
        if (productRepository.count() == 0) {
            log.info("Seeding 12 Inch Fries menu items...");
            createProductWithStock(business.getId(), catSignature.getId(), "The Original 12", "SF-01", "12F-001", 40.00, 99.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Smoky Storm", "SF-02", "12F-002", 45.00, 109.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "New York Crunch", "SF-03", "12F-003", 45.00, 109.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "BBQ Burner", "SF-04", "12F-004", 45.00, 109.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Chipotle Kick", "SF-05", "12F-005", 50.00, 119.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Cheese Blast", "SF-06", "12F-006", 50.00, 119.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Jalapeño Melt", "SF-07", "12F-007", 55.00, 129.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Garlic Crush", "SF-08", "12F-008", 45.00, 109.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Mint Fire", "SF-09", "12F-009", 45.00, 109.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Smoky Melt", "SF-10", "12F-010", 55.00, 129.00, "pcs", 50);
            createProductWithStock(business.getId(), catSignature.getId(), "Chipotle Meltdown", "SF-11", "12F-011", 55.00, 129.00, "pcs", 50);

            createProductWithStock(business.getId(), catSpecial.getId(), "12 Inch Signature", "HS-12", "12F-012", 65.00, 149.00, "pcs", 50);
            createProductWithStock(business.getId(), catByo.getId(), "Build Your Own 12\"", "BYO-13", "12F-013", 50.00, 119.00, "pcs", 50);

            createProductWithStock(business.getId(), catAddons.getId(), "Jalapeño Add-On", "AO-14", "12F-014", 8.00, 20.00, "pcs", 100);
            createProductWithStock(business.getId(), catAddons.getId(), "Extra Cheese Add-On", "AO-15", "12F-015", 12.00, 30.00, "pcs", 100);
            createProductWithStock(business.getId(), catAddons.getId(), "Extra Sauce Add-On", "AO-16", "12F-016", 5.00, 15.00, "pcs", 100);
            log.info("Finished seeding 16 menu products and stock.");
        }

        // 5. Seed Printer Config
        if (printerRepository.count() == 0) {
            Printer printer = Printer.builder()
                    .businessId(business.getId())
                    .name("SHREYANS SRS588")
                    .address("00:11:22:33:44:55")
                    .connectionType("BLUETOOTH")
                    .paperWidth(58)
                    .status("DISCONNECTED")
                    .build();
            printerRepository.save(printer);
            log.info("Seeded default thermal printer: SHREYANS SRS588.");
        }

        log.info("BillPro SQLite database initialization complete. System ready.");
    }

    private Category getOrCreateCategory(Long businessId, String name) {
        List<Category> categories = categoryRepository.findByBusinessId(businessId);
        for (Category cat : categories) {
            if (cat.getName().equalsIgnoreCase(name)) {
                return cat;
            }
        }
        Category newCat = Category.builder()
                .businessId(businessId)
                .name(name)
                .build();
        return categoryRepository.save(newCat);
    }

    private void createProductWithStock(Long businessId, Long categoryId, String name, String sku, String barcode,
                                        double purchasePrice, double sellingPrice, String unit, int stock) {
        Product product = Product.builder()
                .businessId(businessId)
                .categoryId(categoryId)
                .name(name)
                .sku(sku)
                .barcode(barcode)
                .purchasePrice(BigDecimal.valueOf(purchasePrice))
                .sellingPrice(BigDecimal.valueOf(sellingPrice))
                .unit(unit)
                .lowStockThreshold(10)
                .active(true)
                .build();
        product = productRepository.save(product);

        Inventory inv = Inventory.builder()
                .productId(product.getId())
                .currentStock(stock)
                .build();
        inventoryRepository.save(inv);
    }
}
