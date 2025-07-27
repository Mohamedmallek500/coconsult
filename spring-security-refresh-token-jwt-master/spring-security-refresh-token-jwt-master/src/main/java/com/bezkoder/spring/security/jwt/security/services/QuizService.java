package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dtoQuiz.QuestionDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizResponseDTO;
import com.bezkoder.spring.security.jwt.models.Question;
import com.bezkoder.spring.security.jwt.models.Quiz;
import com.bezkoder.spring.security.jwt.repository.QuestionRepository;
import com.bezkoder.spring.security.jwt.repository.QuizRepository;
import com.bezkoder.spring.security.jwt.repository.QuizResponseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
        question.setOptions(questionDTO.getOptions());
        question.setQuiz(quiz);
        question.setParentQuestionId(questionDTO.getParentQuestionId());
        question.setParentAnswer(questionDTO.getParentAnswer());

        Question savedQuestion = questionRepository.save(question);

        // Handle follow-up questions
        List<QuestionDTO> followUpDTOs = new ArrayList<>();
        for (QuestionDTO followUpDTO : questionDTO.getFollowUpQuestions()) {
            // Set parentQuestionId for follow-up questions
            followUpDTO.setParentQuestionId(savedQuestion.getId());
            Question followUpQuestion = new Question();
            followUpQuestion.setContent(followUpDTO.getContent());
            followUpQuestion.setType(followUpDTO.getType());
            followUpQuestion.setOptions(followUpDTO.getOptions());
            followUpQuestion.setQuiz(quiz);
            followUpQuestion.setParentQuestionId(savedQuestion.getId()); // Set the parent ID
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

        // Fetch only top-level questions (parentQuestionId is null)
        List<QuestionDTO> questionDTOs = questionRepository.findByQuizIdAndParentQuestionIdIsNull(quizId)
                .stream()
                .map(this::mapToQuestionDTO)
                .collect(Collectors.toList());
        quizDTO.setQuestions(questionDTOs);

        return quizDTO;
    }

    public QuizResponseDTO submitResponse(QuizResponseDTO responseDTO) {
        // Implementation for saving quiz responses (unchanged for this fix)
        // Add your existing logic here
        throw new UnsupportedOperationException("submitResponse not implemented");
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

        // Fetch follow-up questions recursively
        List<QuestionDTO> followUpDTOs = questionRepository.findByParentQuestionId(question.getId())
                .stream()
                .map(this::mapToQuestionDTO)
                .collect(Collectors.toList());
        dto.setFollowUpQuestions(followUpDTOs);

        return dto;
    }
}