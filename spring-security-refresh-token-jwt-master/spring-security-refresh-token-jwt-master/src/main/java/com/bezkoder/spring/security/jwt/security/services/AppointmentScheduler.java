package com.bezkoder.spring.security.jwt.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AppointmentScheduler {

    @Autowired
    private AppointmentService appointmentService;

    @Scheduled(cron = "0 */10 * * * *")
    public void manageAppointments() {
        appointmentService.cancelExpiredAppointments();
        appointmentService.deleteExpiredCancelledAppointments();
    }
}