package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Medicament;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

public class MedicamentSpecification {

    public static Specification<Medicament> filterByNom(String nom) {
        return (Root<Medicament> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) -> {
            if (nom == null || nom.trim().isEmpty()) {
                return criteriaBuilder.conjunction(); // Return all if no filter provided
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("nomMedicament")),
                    "%" + nom.toLowerCase() + "%"
            );
        };
    }
}