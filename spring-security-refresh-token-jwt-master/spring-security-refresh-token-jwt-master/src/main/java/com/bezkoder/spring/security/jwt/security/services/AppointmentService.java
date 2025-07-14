package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.dto.AppointmentDTO;

import java.util.List;

public interface AppointmentService {
    AppointmentDTO createAppointment(AppointmentDTO appointmentDTO);
    AppointmentDTO getAppointmentById(Long id);
    List<AppointmentDTO> getAllAppointments();
    AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO);
    void deleteAppointment(Long id);
    List<AppointmentDTO> getAppointmentsByDoctorId(Long doctorId);
    AppointmentDTO confirmAppointment(Long id);
}