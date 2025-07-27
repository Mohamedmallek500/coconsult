package com.bezkoder.spring.security.jwt.dtoQuiz;

import com.bezkoder.spring.security.jwt.models.Question;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FollowUpQuestionDTO {
    private Long id;

    @NotBlank
    @Size(max = 255)
    private String content;

    private Question.QuestionType type;

    private String parentAnswer;
}