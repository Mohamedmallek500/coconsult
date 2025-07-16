package com.bezkoder.spring.security.jwt.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AppointmentScheduler {

    @Autowired
    private AppointmentService appointmentService;

    // Exécute toutes les 10 minutes
    @Scheduled(cron = "0 */10 * * * *")
    public void cancelExpiredAppointments() {
        appointmentService.cancelExpiredAppointments();
    }
}