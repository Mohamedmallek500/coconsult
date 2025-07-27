package com.bezkoder.spring.security.jwt.payload.response;

import com.bezkoder.spring.security.jwt.models.Question;
import com.bezkoder.spring.security.jwt.models.Quiz;
import com.bezkoder.spring.security.jwt.models.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quiz_responses")
@Getter
@Setter
@NoArgsConstructor
public class QuizResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "response_text")
    private String responseText;

    public QuizResponse(Quiz quiz, Question question, User user, String responseText) {
        this.quiz = quiz;
        this.question = question;
        this.user = user;
        this.responseText = responseText;
    }
}