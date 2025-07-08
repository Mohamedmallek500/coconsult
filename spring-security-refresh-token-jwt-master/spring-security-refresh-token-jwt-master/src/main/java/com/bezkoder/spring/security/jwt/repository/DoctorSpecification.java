package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Doctor;
import com.bezkoder.spring.security.jwt.models.ERole;
import com.bezkoder.spring.security.jwt.models.Role;
import com.bezkoder.spring.security.jwt.models.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class DoctorSpecification {

    public static Specification<User> findDoctorsByCriteria(
            String nom, String prenom, String speciality, String adresse) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true); // Avoid duplicate results from joins

            // Initialize predicates
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            // Ensure the entity is of type Doctor
            predicates.add(criteriaBuilder.equal(root.type(), criteriaBuilder.literal(Doctor.class)));

            // Filter only approved doctors
            predicates.add(criteriaBuilder.isTrue(root.get("isApproved")));

            // Filter by nom (case-insensitive)
            if (nom != null && !nom.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("nom")), "%" + nom.toLowerCase() + "%"));
            }

            // Filter by prenom (case-insensitive)
            if (prenom != null && !prenom.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("prenom")), "%" + prenom.toLowerCase() + "%"));
            }

            // Filter by speciality (case-insensitive)
            if (speciality != null && !speciality.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("speciality")), "%" + speciality.toLowerCase() + "%"));
            }

            // Filter by adresse (case-insensitive)
            if (adresse != null && !adresse.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("adresse")), "%" + adresse.toLowerCase() + "%"));
            }

            // Ensure the user has the doctor role
            Join<User, Role> rolesJoin = root.join("roles");
            predicates.add(criteriaBuilder.equal(rolesJoin.get("name"), ERole.doctor));

            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
