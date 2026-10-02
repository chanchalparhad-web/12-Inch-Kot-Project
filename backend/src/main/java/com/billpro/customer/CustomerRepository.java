package com.billpro.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByBusinessId(Long businessId);

    @Query("SELECT c FROM Customer c WHERE c.businessId = :businessId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "c.mobile LIKE CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(@Param("businessId") Long businessId, @Param("query") String query);
}
