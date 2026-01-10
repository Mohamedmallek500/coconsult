package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dtoQuiz.QuestionDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizResponseDTO;
import com.bezkoder.spring.security.jwt.models.Question;
import com.bezkoder.spring.security.jwt.models.Quiz;
import com.bezkoder.spring.security.jwt.models.User;
import com.bezkoder.spring.security.jwt.payload.response.QuizResponse;
import com.bezkoder.spring.security.jwt.repository.QuestionRepository;
import com.bezkoder.spring.security.jwt.repository.QuizRepository;
import com.bezkoder.spring.security.jwt.repository.QuizResponseRepository;
import com.bezkoder.spring.security.jwt.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {
    private static final Logger logger = LoggerFactory.getLogger(QuizService.class);

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizResponseRepository quizResponseRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public QuizDTO createQuiz(QuizDTO quizDTO) {
        Quiz quiz = new Quiz();
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        Quiz savedQuiz = quizRepository.save(quiz);

        List<QuestionDTO> questionDTOs = new ArrayList<>();
        for (QuestionDTO questionDTO : quizDTO.getQuestions()) {
            QuestionDTO addedQuestion = addQuestionToQuiz(savedQuiz.getId(), questionDTO);
            questionDTOs.add(addedQuestion);
        }

        QuizDTO result = new QuizDTO();
        result.setId(savedQuiz.getId());
        result.setTitle(savedQuiz.getTitle());
        result.setDescription(savedQuiz.getDescription());
        result.setQuestions(questionDTOs);
        return result;
    }

    @Transactional
    public QuestionDTO addQuestionToQuiz(Long quizId, QuestionDTO questionDTO) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));

        // Create the main question
        Question question = new Question();
        question.setContent(questionDTO.getContent());
        question.setType(questionDTO.getType());
        if (questionDTO.getType() == Question.QuestionType.YES_NO && (questionDTO.getOptions() == null || questionDTO.getOptions().isEmpty())) {
            question.setOptions(List.of("Yes", "No"));
        } else {
            question.setOptions(questionDTO.getOptions());
        }
        question.setQuiz(quiz);
        question.setParentQuestionId(questionDTO.getParentQuestionId());
        question.setParentAnswer(questionDTO.getParentAnswer());

        Question savedQuestion = questionRepository.save(question);

        // Handle follow-up questions
        List<QuestionDTO> followUpDTOs = new ArrayList<>();
        for (QuestionDTO followUpDTO : questionDTO.getFollowUpQuestions()) {
            followUpDTO.setParentQuestionId(savedQuestion.getId());
            Question followUpQuestion = new Question();
            followUpQuestion.setContent(followUpDTO.getContent());
            followUpQuestion.setType(followUpDTO.getType());
            if (followUpDTO.getType() == Question.QuestionType.YES_NO && (followUpDTO.getOptions() == null || followUpDTO.getOptions().isEmpty())) {
                followUpQuestion.setOptions(List.of("Yes", "No"));
            } else {
                followUpQuestion.setOptions(followUpDTO.getOptions());
            }
            followUpQuestion.setQuiz(quiz);
            followUpQuestion.setParentQuestionId(savedQuestion.getId());
            followUpQuestion.setParentAnswer(followUpDTO.getParentAnswer());

            Question savedFollowUp = questionRepository.save(followUpQuestion);
            followUpDTOs.add(mapToQuestionDTO(savedFollowUp));
        }

        QuestionDTO result = mapToQuestionDTO(savedQuestion);
        result.setFollowUpQuestions(followUpDTOs);
        return result;
    }

    public QuizDTO getQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));

        QuizDTO quizDTO = new QuizDTO();
        quizDTO.setId(quiz.getId());
        quizDTO.setTitle(quiz.getTitle());
        quizDTO.setDescription(quiz.getDescription());

        List<QuestionDTO> questionDTOs = questionRepository.findByQuizIdAndParentQuestionIdIsNull(quizId)
                .stream()
                .map(this::mapToQuestionDTO)
                .collect(Collectors.toList());
        quizDTO.setQuestions(questionDTOs);

        return quizDTO;
    }

    @Transactional
    public QuizResponseDTO submitResponse(QuizResponseDTO responseDTO) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        logger.info("Authenticated user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Validate quiz
        Quiz quiz = quizRepository.findById(responseDTO.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + responseDTO.getQuizId()));

        // Validate question
        Question question = questionRepository.findById(responseDTO.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + responseDTO.getQuestionId()));

        // Ensure question belongs to the quiz
        if (!question.getQuiz().getId().equals(quiz.getId())) {
            throw new RuntimeException("Question ID: " + responseDTO.getQuestionId() + " does not belong to Quiz ID: " + responseDTO.getQuizId());
        }

        // Validate response based on question type
        if (question.getType() == Question.QuestionType.YES_NO && !List.of("Yes", "No").contains(responseDTO.getResponseText())) {
            throw new RuntimeException("Invalid response for YES_NO question: " + responseDTO.getResponseText());
        } else if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
            if (question.getOptions() != null && !question.getOptions().contains(responseDTO.getResponseText())) {
                throw new RuntimeException("Invalid response for MULTIPLE_CHOICE question: " + responseDTO.getResponseText());
            }
        } // TEXT type allows any non-empty string, validated by @NotBlank in QuizResponseDTO

        // Save response
        QuizResponse response = new QuizResponse(quiz, question, user, responseDTO.getResponseText());
        QuizResponse savedResponse = quizResponseRepository.save(response);

        // Map to DTO
        QuizResponseDTO result = new QuizResponseDTO();
        result.setQuizId(savedResponse.getQuiz().getId());
        result.setQuestionId(savedResponse.getQuestion().getId());
        result.setResponseText(savedResponse.getResponseText());

        // Include follow-up questions if any
        List<QuestionDTO> followUpQuestions = getFollowUpQuestions(question.getId(), responseDTO.getResponseText());
        result.setFollowUpQuestions(followUpQuestions);

        // If no follow-up questions, include the next main question
        if (followUpQuestions.isEmpty()) {
            QuestionDTO nextQuestion = getNextMainQuestion(quiz.getId(), question.getId(), userId);
            result.setNextQuestion(nextQuestion);
        }

        logger.info("Response saved for quiz ID: {}, question ID: {}, user ID: {}", quiz.getId(), question.getId(), userId);
        return result;
    }

    private QuestionDTO getNextMainQuestion(Long quizId, Long currentQuestionId, Long userId) {
        // Get all main questions (parentQuestionId is null) for the quiz, ordered by ID
        List<Question> mainQuestions = questionRepository.findByQuizIdAndParentQuestionIdIsNull(quizId)
                .stream()
                .sorted((q1, q2) -> q1.getId().compareTo(q2.getId()))
                .collect(Collectors.toList());

        // Get questions the user has already answered
        List<Long> answeredQuestionIds = quizResponseRepository.findByQuizIdAndUserId(quizId, userId)
                .stream()
                .map(response -> response.getQuestion().getId())
                .collect(Collectors.toList());

        // Find the next main question that hasn't been answered
        for (Question question : mainQuestions) {
            if (question.getId() > currentQuestionId && !answeredQuestionIds.contains(question.getId())) {
                return mapToQuestionDTO(question);
            }
        }

        // Return null if no next question is found (end of quiz)
        return null;
    }

    public List<QuestionDTO> getFollowUpQuestions(Long questionId, String parentAnswer) {
        List<Question> followUpQuestions = questionRepository.findByParentQuestionIdAndParentAnswer(questionId, parentAnswer);
        return followUpQuestions.stream()
                .map(this::mapToQuestionDTO)
                .collect(Collectors.toList());
    }

    private QuestionDTO mapToQuestionDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setContent(question.getContent());
        dto.setType(question.getType());
        dto.setOptions(question.getOptions());
        dto.setParentQuestionId(question.getParentQuestionId());
        dto.setParentAnswer(question.getParentAnswer());

        List<QuestionDTO> followUpDTOs = questionRepository.findByParentQuestionId(question.getId())
                .stream()
                .map(this::mapToQuestionDTO)
                .collect(Collectors.toList());
        dto.setFollowUpQuestions(followUpDTOs);

        return dto;
    }
}
