package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Role;
import com.bezkoder.spring.security.jwt.models.User;
import com.bezkoder.spring.security.jwt.models.ERole;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> findUsersByCriteria(String nom, String prenom, String role) {
        return (root, query, criteriaBuilder) -> {
            var predicates = criteriaBuilder.conjunction();

            // Filter by nom (case-insensitive)
            if (nom != null && !nom.isEmpty()) {
                predicates = criteriaBuilder.and(
                        predicates,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("nom")),
                                "%" + nom.toLowerCase() + "%"
                        )
                );
            }

            // Filter by prenom (case-insensitive)
            if (prenom != null && !prenom.isEmpty()) {
                predicates = criteriaBuilder.and(
                        predicates,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("prenom")),
                                "%" + prenom.toLowerCase() + "%"
                        )
                );
            }

            // Filter by role
            if (role != null && !role.isEmpty()) {
                Join<User, Role> roleJoin = root.join("roles");
                predicates = criteriaBuilder.and(
                        predicates,
                        criteriaBuilder.equal(roleJoin.get("name"), ERole.valueOf(role))
                );
            }

            return predicates;
        };
    }
}