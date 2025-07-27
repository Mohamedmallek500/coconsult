package com.bezkoder.spring.security.jwt.dtoQuiz;

import com.bezkoder.spring.security.jwt.models.Question;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class QuestionDTO {
    private Long id;

    @NotBlank
    @Size(max = 255)
    private String content;

    private Question.QuestionType type;

    private List<String> options = new ArrayList<>();

    private List<FollowUpQuestionDTO> followUpQuestions = new ArrayList<>();
}