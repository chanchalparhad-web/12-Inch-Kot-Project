package com.billpro.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByBusinessIdAndActiveTrue(Long businessId);

    @Query("SELECT p FROM Product p WHERE p.businessId = :businessId AND p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("businessId") Long businessId, @Param("query") String query);

    List<Product> findByBusinessIdAndCategoryIdAndActiveTrue(Long businessId, Long categoryId);
}
