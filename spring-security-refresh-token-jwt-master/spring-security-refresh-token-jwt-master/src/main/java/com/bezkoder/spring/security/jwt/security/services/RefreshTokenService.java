package com.bezkoder.spring.security.jwt.security.services;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bezkoder.spring.security.jwt.exception.TokenRefreshException;
import com.bezkoder.spring.security.jwt.models.RefreshToken;
import com.bezkoder.spring.security.jwt.models.User;
import com.bezkoder.spring.security.jwt.repository.RefreshTokenRepository;
import com.bezkoder.spring.security.jwt.repository.UserRepository;

@Service
public class RefreshTokenService {
  private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

  @Value("${bezkoder.app.jwtRefreshExpirationMs}")
  private Long refreshTokenDurationMs;

  @Autowired
  private RefreshTokenRepository refreshTokenRepository;

  @Autowired
  private UserRepository userRepository;

  public Optional<RefreshToken> findByToken(String token) {
    logger.info("Finding refresh token: {}", token);
    return refreshTokenRepository.findByToken(token);
  }

  @Transactional
  public RefreshToken createRefreshToken(Long userId) {
    logger.info("Creating refresh token for userId: {}", userId);

    // Find user
    User user = userRepository.findById(userId)
            .orElseThrow(() -> {
              logger.error("User not found with id: {}", userId);
              return new RuntimeException("User not found with id: " + userId);
            });

    // Delete existing refresh token for this user
    try {
      int deleted = refreshTokenRepository.deleteByUser(user);
      logger.info("Deleted {} existing refresh tokens for userId: {}", deleted, userId);
    } catch (Exception e) {
      logger.error("Failed to delete existing refresh token for userId: {}. Error: {}", userId, e.getMessage(), e);
      throw new RuntimeException("Failed to delete existing refresh token for userId: " + userId, e);
    }

    // Create new refresh token
    RefreshToken refreshToken = new RefreshToken();
    refreshToken.setUser(user);
    refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
    refreshToken.setToken(UUID.randomUUID().toString());

    // Save and return
    try {
      refreshToken = refreshTokenRepository.save(refreshToken);
      logger.info("Created refresh token: {} for userId: {}", refreshToken.getToken(), userId);
      return refreshToken;
    } catch (Exception e) {
      logger.error("Failed to save refresh token for userId: {}. Error: {}", userId, e.getMessage(), e);
      throw new RuntimeException("Failed to save refresh token for userId: " + userId, e);
    }
  }

  public RefreshToken verifyExpiration(RefreshToken token) {
    if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
      logger.warn("Refresh token expired: {}", token.getToken());
      refreshTokenRepository.delete(token);
      throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new signin request");
    }
    logger.info("Refresh token is valid: {}", token.getToken());
    return token;
  }

  @Transactional
  public int deleteByUserId(Long userId) {
    logger.info("Deleting refresh token for userId: {}", userId);
    User user = userRepository.findById(userId)
            .orElseThrow(() -> {
              logger.error("User not found with id: {}", userId);
              return new RuntimeException("User not found with id: " + userId);
            });
    try {
      int deleted = refreshTokenRepository.deleteByUser(user);
      logger.info("Deleted {} refresh tokens for userId: {}", deleted, userId);
      return deleted;
    } catch (Exception e) {
      logger.error("Failed to delete refresh token for userId: {}. Error: {}", userId, e.getMessage(), e);
      throw new RuntimeException("Failed to delete refresh token for userId: " + userId, e);
    }
  }
}