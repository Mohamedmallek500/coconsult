package com.bezkoder.spring.security.jwt.dtoQuiz;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class QuizResponseDTO {
    private Long quizId;
    private Long questionId;
    @NotBlank
    private String responseText;
    private List<QuestionDTO> followUpQuestions = new ArrayList<>();
    private QuestionDTO nextQuestion;

}