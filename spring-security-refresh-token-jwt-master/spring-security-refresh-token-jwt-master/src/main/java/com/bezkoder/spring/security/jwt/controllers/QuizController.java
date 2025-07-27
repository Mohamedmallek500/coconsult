package com.bezkoder.spring.security.jwt.controllers;

import com.bezkoder.spring.security.jwt.dtoQuiz.QuestionDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizResponseDTO;
import com.bezkoder.spring.security.jwt.payload.response.MessageResponse;
import com.bezkoder.spring.security.jwt.security.services.QuizService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/quiz")
public class QuizController {
    private static final Logger logger = LoggerFactory.getLogger(QuizController.class);

    @Autowired
    private QuizService quizService;

    @PostMapping("/create")
    public ResponseEntity<?> createQuiz(@Valid @RequestBody QuizDTO quizDTO) {
        try {
            QuizDTO createdQuiz = quizService.createQuiz(quizDTO);
            logger.info("Quiz created successfully with ID: {}", createdQuiz.getId());
            return ResponseEntity.ok(createdQuiz);
        } catch (Exception e) {
            logger.error("Failed to create quiz: {}", e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{quizId}/question")
    public ResponseEntity<?> addQuestionToQuiz(@PathVariable Long quizId, @Valid @RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO addedQuestion = quizService.addQuestionToQuiz(quizId, questionDTO);
            logger.info("Question added to quiz ID: {}", quizId);
            return ResponseEntity.ok(addedQuestion);
        } catch (Exception e) {
            logger.error("Failed to add question to quiz ID: {}. Error: {}", quizId, e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuiz(@PathVariable Long quizId) {
        try {
            QuizDTO quiz = quizService.getQuiz(quizId);
            logger.info("Quiz ID: {} retrieved successfully", quizId);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            logger.error("Failed to retrieve quiz ID: {}. Error: {}", quizId, e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/response")
    public ResponseEntity<?> submitResponse(@Valid @RequestBody QuizResponseDTO responseDTO) {
        try {
            QuizResponseDTO savedResponse = quizService.submitResponse(responseDTO);
            logger.info("Response submitted for quiz ID: {}", responseDTO.getQuizId());
            return ResponseEntity.ok(savedResponse);
        } catch (Exception e) {
            logger.error("Failed to submit response for quiz ID: {}. Error: {}", responseDTO.getQuizId(), e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/question/{questionId}/follow-up")
    public ResponseEntity<?> getFollowUpQuestions(@PathVariable Long questionId, @RequestParam String parentAnswer) {
        try {
            return ResponseEntity.ok(quizService.getFollowUpQuestions(questionId, parentAnswer));
        } catch (Exception e) {
            logger.error("Failed to retrieve follow-up questions for question ID: {}. Error: {}", questionId, e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}