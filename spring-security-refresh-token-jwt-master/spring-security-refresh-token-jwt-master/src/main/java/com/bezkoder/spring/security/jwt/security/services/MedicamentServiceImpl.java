package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dto.MedicamentDTO;
import com.bezkoder.spring.security.jwt.models.Medicament;
import com.bezkoder.spring.security.jwt.repository.MedicamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicamentServiceImpl implements MedicamentService {

    @Autowired
    private MedicamentRepository medicamentRepository;

    @Override
    @Transactional
    public MedicamentDTO createMedicament(MedicamentDTO medicamentDTO) {
        Medicament medicament = new Medicament(medicamentDTO.getNomMedicament(), medicamentDTO.getNotes());
        medicament = medicamentRepository.save(medicament);
        return convertToDTO(medicament);
    }

    @Override
    public MedicamentDTO getMedicamentById(Long id) {
        Medicament medicament = medicamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicament not found"));
        return convertToDTO(medicament);
    }

    @Override
    public List<MedicamentDTO> getAllMedicaments() {
        return medicamentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicamentDTO updateMedicament(Long id, MedicamentDTO medicamentDTO) {
        Medicament medicament = medicamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicament not found"));
        medicament.setNomMedicament(medicamentDTO.getNomMedicament());
        medicament.setNotes(medicamentDTO.getNotes());
        medicament = medicamentRepository.save(medicament);
        return convertToDTO(medicament);
    }

    @Override
    @Transactional
    public void deleteMedicament(Long id) {
        if (!medicamentRepository.existsById(id)) {
            throw new RuntimeException("Medicament not found");
        }
        medicamentRepository.deleteById(id);
    }

    private MedicamentDTO convertToDTO(Medicament medicament) {
        return new MedicamentDTO(
                medicament.getId(),
                medicament.getNomMedicament(),
                medicament.getNotes()
        );
    }
}