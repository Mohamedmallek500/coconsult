package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "follow_up_questions")
@Getter
@Setter
@NoArgsConstructor
public class FollowUpQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    private String content;

    @Enumerated(EnumType.STRING)
    private Question.QuestionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_question_id")
    private Question parentQuestion;

    @Column(name = "parent_answer")
    private String parentAnswer;

    public FollowUpQuestion(String content, Question.QuestionType type, Question parentQuestion, String parentAnswer) {
        this.content = content;
        this.type = type;
        this.parentQuestion = parentQuestion;
        this.parentAnswer = parentAnswer;
    }
}