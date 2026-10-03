package com.billpro.product;

import com.billpro.exception.ResourceNotFoundException;
import com.billpro.inventory.Inventory;
import com.billpro.inventory.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public ProductService(ProductRepository productRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<Product> getProducts(Long businessId, String query, Long categoryId) {
        if (query != null && !query.trim().isEmpty()) {
            return productRepository.searchProducts(businessId, query.trim());
        }
        if (categoryId != null) {
            return productRepository.findByBusinessIdAndCategoryIdAndActiveTrue(businessId, categoryId);
        }
        return productRepository.findByBusinessIdAndActiveTrue(businessId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public Product createProduct(Product product, Integer initialStock) {
        if (product.getBusinessId() == null) {
            product.setBusinessId(1L);
        }
        product.setActive(true);
        Product saved = productRepository.save(product);

        // Initialize inventory stock record
        Inventory inventory = Inventory.builder()
                .productId(saved.getId())
                .currentStock(initialStock != null ? initialStock : 0)
                .build();
        inventoryRepository.save(inventory);

        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, Product details) {
        Product product = getProductById(id);
        product.setName(details.getName());
        product.setCategoryId(details.getCategoryId());
        product.setSku(details.getSku());
        product.setBarcode(details.getBarcode());
        product.setPurchasePrice(details.getPurchasePrice());
        product.setSellingPrice(details.getSellingPrice());
        product.setUnit(details.getUnit());
        product.setLowStockThreshold(details.getLowStockThreshold());
        return productRepository.save(product);
    }

    @Transactional
    public void deactivateProduct(Long id) {
        // Rule 6: Deactivate product instead of hard deleting to preserve historical invoices!
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }
}
