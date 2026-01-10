package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.payload.response.QuizResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResponseRepository extends JpaRepository<QuizResponse, Long> {
    List<QuizResponse> findByQuizIdAndUserId(Long quizId, Long userId);
}