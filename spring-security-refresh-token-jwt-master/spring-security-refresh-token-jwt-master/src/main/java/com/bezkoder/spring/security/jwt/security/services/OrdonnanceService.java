package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dto.OrdonnanceDTO;

import java.util.List;

public interface OrdonnanceService {
    OrdonnanceDTO createOrdonnance(OrdonnanceDTO ordonnanceDTO);
    OrdonnanceDTO getOrdonnanceById(Long id);
    List<OrdonnanceDTO> getAllOrdonnances();
    OrdonnanceDTO updateOrdonnance(Long id, OrdonnanceDTO ordonnanceDTO);
    void deleteOrdonnance(Long id);
}