package com.bezkoder.spring.security.jwt.dtoQuiz;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizResponseDTO {
    private Long quizId;
    private Long questionId;
    @NotBlank
    private String responseText;
}