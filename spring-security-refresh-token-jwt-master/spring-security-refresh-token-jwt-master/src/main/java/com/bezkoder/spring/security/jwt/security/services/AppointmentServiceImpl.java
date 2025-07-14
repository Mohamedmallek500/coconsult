package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dto.AppointmentDTO;
import com.bezkoder.spring.security.jwt.models.*;
import com.bezkoder.spring.security.jwt.repository.AppointmentRepository;
import com.bezkoder.spring.security.jwt.repository.OrdonnanceRepository;
import com.bezkoder.spring.security.jwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrdonnanceRepository ordonnanceRepository;

    @Override
    @Transactional
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        User doctorUser = userRepository.findById(appointmentDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!(doctorUser instanceof Doctor)) {
            throw new RuntimeException("User is not a Doctor");
        }
        Doctor doctor = (Doctor) doctorUser;
        if (!doctor.isApproved()) {
            throw new RuntimeException("Doctor is not approved");
        }
        User patientUser = userRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!(patientUser instanceof Patient)) {
            throw new RuntimeException("User is not a Patient");
        }
        Patient patient = (Patient) patientUser;

        Ordonnance ordonnance = new Ordonnance(patient, doctor, new HashSet<>());
        ordonnance = ordonnanceRepository.save(ordonnance);
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setDate(appointmentDTO.getDate());
        appointment.setOrdonnance(ordonnance);
        appointment.setStatus(AppointmentStatus.PENDING); // Statut par défaut PENDING
        appointment = appointmentRepository.save(appointment);
        return convertToDTO(appointment);
    }

    @Override
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return convertToDTO(appointment);
    }

    @Override
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        User doctorUser = userRepository.findById(appointmentDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!(doctorUser instanceof Doctor)) {
            throw new RuntimeException("User is not a Doctor");
        }
        Doctor doctor = (Doctor) doctorUser;
        if (!doctor.isApproved()) {
            throw new RuntimeException("Doctor is not approved");
        }
        User patientUser = userRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!(patientUser instanceof Patient)) {
            throw new RuntimeException("User is not a Patient");
        }
        Patient patient = (Patient) patientUser;

        Ordonnance ordonnance = appointment.getOrdonnance();
        if (ordonnance == null) {
            ordonnance = new Ordonnance(patient, doctor, new HashSet<>());
            ordonnance = ordonnanceRepository.save(ordonnance);
            appointment.setOrdonnance(ordonnance);
        } else {
            ordonnance.setDoctor(doctor);
            ordonnance.setPatient(patient);
            ordonnanceRepository.save(ordonnance);
        }
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setDate(appointmentDTO.getDate());
        appointment.setStatus(appointmentDTO.getStatus() != null ? appointmentDTO.getStatus() : appointment.getStatus());
        appointment = appointmentRepository.save(appointment);
        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (appointment.getOrdonnance() != null) {
            ordonnanceRepository.delete(appointment.getOrdonnance());
        }
        appointmentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AppointmentDTO confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Appointment is already confirmed");
        }
        if (appointmentRepository.existsByDoctorAndDateAndStatus(appointment.getDoctor(), appointment.getDate(), AppointmentStatus.CONFIRMED)) {
            throw new RuntimeException("Doctor already has a confirmed appointment at this time");
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        return convertToDTO(appointment);
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDoctorId(Long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AppointmentDTO convertToDTO(Appointment appointment) {
        return new AppointmentDTO(
                appointment.getId(),
                appointment.getDoctor().getId(),
                appointment.getPatient().getId(),
                appointment.getDate(),
                appointment.getOrdonnance() != null ? appointment.getOrdonnance().getId() : null,
                appointment.getStatus()
        );
    }
}