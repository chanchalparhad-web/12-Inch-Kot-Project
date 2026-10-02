package com.billpro.expense;

import com.billpro.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> getExpenses(Long businessId) {
        return expenseRepository.findByBusinessIdOrderByExpenseDateDesc(businessId);
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
    }

    @Transactional
    public Expense createExpense(Expense expense) {
        if (expense.getBusinessId() == null) {
            expense.setBusinessId(1L);
        }
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(Long id, Expense details) {
        Expense expense = getExpenseById(id);
        expense.setCategory(details.getCategory());
        expense.setDescription(details.getDescription());
        expense.setAmount(details.getAmount());
        expense.setPaymentMethod(details.getPaymentMethod());
        expense.setExpenseDate(details.getExpenseDate());
        expense.setNotes(details.getNotes());
        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = getExpenseById(id);
        expenseRepository.delete(expense);
    }
}
