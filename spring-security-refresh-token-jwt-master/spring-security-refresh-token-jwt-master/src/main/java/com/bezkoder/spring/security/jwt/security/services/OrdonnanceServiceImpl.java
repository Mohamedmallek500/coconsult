package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dto.OrdonnanceDTO;
import com.bezkoder.spring.security.jwt.models.Doctor;
import com.bezkoder.spring.security.jwt.models.Medicament;
import com.bezkoder.spring.security.jwt.models.Ordonnance;
import com.bezkoder.spring.security.jwt.models.Patient;
import com.bezkoder.spring.security.jwt.models.User;
import com.bezkoder.spring.security.jwt.repository.MedicamentRepository;
import com.bezkoder.spring.security.jwt.repository.OrdonnanceRepository;
import com.bezkoder.spring.security.jwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrdonnanceServiceImpl implements OrdonnanceService {

    @Autowired
    private OrdonnanceRepository ordonnanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicamentRepository medicamentRepository;

    @Override
    @Transactional
    public OrdonnanceDTO createOrdonnance(OrdonnanceDTO ordonnanceDTO) {
        throw new UnsupportedOperationException("Ordonnance creation is handled by AppointmentService");
    }

    @Override
    public OrdonnanceDTO getOrdonnanceById(Long id) {
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordonnance not found"));
        return convertToDTO(ordonnance);
    }

    @Override
    public List<OrdonnanceDTO> getAllOrdonnances() {
        return ordonnanceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrdonnanceDTO updateOrdonnance(Long id, OrdonnanceDTO ordonnanceDTO) {
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordonnance not found"));
        User doctorUser = userRepository.findById(ordonnanceDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!(doctorUser instanceof Doctor)) {
            throw new RuntimeException("User is not a Doctor");
        }
        Doctor doctor = (Doctor) doctorUser;
        if (!doctor.isApproved()) {
            throw new RuntimeException("Doctor is not approved");
        }
        User patientUser = userRepository.findById(ordonnanceDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!(patientUser instanceof Patient)) {
            throw new RuntimeException("User is not a Patient");
        }
        Patient patient = (Patient) patientUser;
        // Validate that Ordonnance matches Appointment's doctor and patient
        if (!ordonnance.getDoctor().getId().equals(ordonnanceDTO.getDoctorId()) ||
                !ordonnance.getPatient().getId().equals(ordonnanceDTO.getPatientId())) {
            throw new RuntimeException("Ordonnance doctor or patient cannot be changed");
        }
        Set<Medicament> medicaments = ordonnanceDTO.getMedicamentIds() != null
                ? ordonnanceDTO.getMedicamentIds().stream()
                .map(medId -> medicamentRepository.findById(medId)
                        .orElseThrow(() -> new RuntimeException("Medicament not found")))
                .collect(Collectors.toSet())
                : new HashSet<>();
        ordonnance.setMedicaments(medicaments);
        ordonnance = ordonnanceRepository.save(ordonnance);
        return convertToDTO(ordonnance);
    }

    @Override
    @Transactional
    public void deleteOrdonnance(Long id) {
        throw new UnsupportedOperationException("Ordonnance deletion is handled by AppointmentService");
    }

    private OrdonnanceDTO convertToDTO(Ordonnance ordonnance) {
        return new OrdonnanceDTO(
                ordonnance.getId(),
                ordonnance.getPatient().getId(),
                ordonnance.getDoctor().getId(),
                ordonnance.getMedicaments().stream().map(Medicament::getId).collect(Collectors.toSet())
        );
    }
}