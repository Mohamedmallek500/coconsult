package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.FollowUpQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpQuestionRepository extends JpaRepository<FollowUpQuestion, Long> {
    List<FollowUpQuestion> findByParentQuestionIdAndParentAnswer(Long parentQuestionId, String parentAnswer);
}