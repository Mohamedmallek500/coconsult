package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dto.MedicamentDTO;
import java.util.List;

public interface MedicamentService {
    MedicamentDTO createMedicament(MedicamentDTO medicamentDTO);
    MedicamentDTO getMedicamentById(Long id);
    List<MedicamentDTO> getAllMedicaments();
    MedicamentDTO updateMedicament(Long id, MedicamentDTO medicamentDTO);
    void deleteMedicament(Long id);
}