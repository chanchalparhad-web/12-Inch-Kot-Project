package com.billpro.business;

import com.billpro.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;

    public BusinessService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    public Business getBusiness(Long id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
    }

    @Transactional
    public Business updateBusiness(Long id, Business details) {
        Business business = getBusiness(id);
        business.setName(details.getName());
        business.setOwnerName(details.getOwnerName());
        business.setMobile(details.getMobile());
        business.setEmail(details.getEmail());
        business.setAddress(details.getAddress());
        business.setCity(details.getCity());
        business.setState(details.getState());
        business.setPincode(details.getPincode());
        business.setGstEnabled(details.getGstEnabled());
        business.setGstin(details.getGstin());
        business.setInvoicePrefix(details.getInvoicePrefix());
        return businessRepository.save(business);
    }
}
