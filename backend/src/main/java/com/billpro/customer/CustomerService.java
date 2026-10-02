package com.billpro.customer;

import com.billpro.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getCustomers(Long businessId, String query) {
        if (query != null && !query.trim().isEmpty()) {
            return customerRepository.searchCustomers(businessId, query.trim());
        }
        return customerRepository.findByBusinessId(businessId);
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Transactional
    public Customer createCustomer(Customer customer) {
        if (customer.getBusinessId() == null) {
            customer.setBusinessId(1L);
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer details) {
        Customer customer = getCustomerById(id);
        customer.setName(details.getName());
        customer.setMobile(details.getMobile());
        customer.setEmail(details.getEmail());
        customer.setAddress(details.getAddress());
        customer.setGstin(details.getGstin());
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }
}
