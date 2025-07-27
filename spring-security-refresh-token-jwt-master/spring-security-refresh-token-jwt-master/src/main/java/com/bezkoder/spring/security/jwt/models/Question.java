package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ElementCollection
    private List<String> options;

    @Column(name = "parent_question_id")
    private Long parentQuestionId;

    @Column(name = "parent_answer")
    private String parentAnswer;

    public enum QuestionType {
        YES_NO, MULTIPLE_CHOICE, TEXT
    }
}