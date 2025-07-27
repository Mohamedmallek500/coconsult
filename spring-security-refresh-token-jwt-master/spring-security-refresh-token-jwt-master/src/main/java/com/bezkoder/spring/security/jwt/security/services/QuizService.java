package com.bezkoder.spring.security.jwt.security.services;



import com.bezkoder.spring.security.jwt.dtoQuiz.FollowUpQuestionDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuestionDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizDTO;
import com.bezkoder.spring.security.jwt.dtoQuiz.QuizResponseDTO;
import com.bezkoder.spring.security.jwt.models.*;
import com.bezkoder.spring.security.jwt.payload.response.QuizResponse;
import com.bezkoder.spring.security.jwt.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private FollowUpQuestionRepository followUpQuestionRepository;

    @Autowired
    private QuizResponseRepository quizResponseRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public QuizDTO createQuiz(QuizDTO quizDTO) {
        Quiz quiz = new Quiz(quizDTO.getTitle(), quizDTO.getDescription());
        quizRepository.save(quiz);
        logger.info("Quiz created with ID: {}", quiz.getId());
        quizDTO.setId(quiz.getId());
        return quizDTO;
    }

    @Transactional
    public QuestionDTO addQuestionToQuiz(Long quizId, QuestionDTO questionDTO) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));
        Question question = new Question();
        question.setContent(questionDTO.getContent());
        question.setType(questionDTO.getType());
        question.setQuiz(quiz);
        question.setOptions(questionDTO.getOptions());
        questionRepository.save(question);

        for (FollowUpQuestionDTO followUpDTO : questionDTO.getFollowUpQuestions()) {
            FollowUpQuestion followUp = new FollowUpQuestion(
                    followUpDTO.getContent(),
                    followUpDTO.getType(),
                    question,
                    followUpDTO.getParentAnswer()
            );
            followUpQuestionRepository.save(followUp);
            followUpDTO.setId(followUp.getId());
        }

        logger.info("Question added to quiz ID: {}", quizId);
        questionDTO.setId(question.getId());
        return questionDTO;
    }

    public QuizDTO getQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + quizId));
        QuizDTO quizDTO = new QuizDTO();
        quizDTO.setId(quiz.getId());
        quizDTO.setTitle(quiz.getTitle());
        quizDTO.setDescription(quiz.getDescription());

        List<QuestionDTO> questionDTOs = questionRepository.findByQuizId(quizId).stream().map(question -> {
            QuestionDTO dto = new QuestionDTO();
            dto.setId(question.getId());
            dto.setContent(question.getContent());
            dto.setType(question.getType());
            dto.setOptions(question.getOptions());
            List<FollowUpQuestionDTO> followUpDTOs = followUpQuestionRepository
                    .findByParentQuestionId(question.getId())
                    .stream()
                    .map(fq -> {
                        FollowUpQuestionDTO fDto = new FollowUpQuestionDTO();
                        fDto.setId(fq.getId());
                        fDto.setContent(fq.getContent());
                        fDto.setType(fq.getType());
                        fDto.setParentAnswer(fq.getParentAnswer());
                        return fDto;
                    })
                    .collect(Collectors.toList());
            dto.setFollowUpQuestions(followUpDTOs);
            return dto;
        }).collect(Collectors.toList());

        quizDTO.setQuestions(questionDTOs);
        return quizDTO;
    }

    @Transactional
    public QuizResponseDTO submitResponse(QuizResponseDTO responseDTO) {
        User user = userRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Quiz quiz = quizRepository.findById(responseDTO.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found with ID: " + responseDTO.getQuizId()));
        Question question = questionRepository.findById(responseDTO.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + responseDTO.getQuestionId()));

        QuizResponse response = new QuizResponse(quiz, question, user, responseDTO.getResponseText());
        quizResponseRepository.save(response);
        logger.info("Response submitted for quiz ID: {}, question ID: {}, user ID: {}", quiz.getId(), question.getId(), user.getId());
        return responseDTO;
    }

    public List<FollowUpQuestionDTO> getFollowUpQuestions(Long questionId, String parentAnswer) {
        return followUpQuestionRepository.findByParentQuestionIdAndParentAnswer(questionId, parentAnswer)
                .stream()
                .map(fq -> {
                    FollowUpQuestionDTO dto = new FollowUpQuestionDTO();
                    dto.setId(fq.getId());
                    dto.setContent(fq.getContent());
                    dto.setType(fq.getType());
                    dto.setParentAnswer(fq.getParentAnswer());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private Long getCurrentUserId() {
        return ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
    }
}