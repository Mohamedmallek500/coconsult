package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dto.MedicamentDTO;
import java.util.List;

public interface MedicamentService {
    MedicamentDTO createMedicament(MedicamentDTO medicamentDTO);
    MedicamentDTO getMedicamentById(Long id);
    List<MedicamentDTO> getAllMedicaments();
    List<MedicamentDTO> filterMedicamentsByNom(String nom); // New method for filtering
    MedicamentDTO updateMedicament(Long id, MedicamentDTO medicamentDTO);
    void deleteMedicament(Long id);
}