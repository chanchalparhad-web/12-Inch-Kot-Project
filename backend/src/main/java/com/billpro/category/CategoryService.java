package com.billpro.category;

import com.billpro.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getCategoriesByBusiness(Long businessId) {
        return categoryRepository.findByBusinessId(businessId);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public Category createCategory(Category category) {
        if (category.getBusinessId() == null) {
            category.setBusinessId(1L);
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category details) {
        Category category = getCategoryById(id);
        category.setName(details.getName());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
