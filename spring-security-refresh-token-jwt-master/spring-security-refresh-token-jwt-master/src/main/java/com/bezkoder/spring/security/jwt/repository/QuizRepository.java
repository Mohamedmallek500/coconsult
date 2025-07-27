package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
}