import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Appointment } from 'src/models/Appointment.model';
import { User } from 'src/models/User.model';
import { AuthServiceService } from 'src/services/auth-service.service';
import { AppointmentService } from 'src/services/AppointmentService.service';
import { UserService } from 'src/services/UserService.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  calendarOptions: CalendarOptions;
  selectedAppointment: Appointment | null = null;
  isProcessing = false;

  constructor(
    private authService: AuthServiceService,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private router: Router
  ) {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      slotDuration: '00:30:00',
      slotMinTime: '08:00:00',
      slotMaxTime: '17:00:00',
      businessHours: [
        {
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '08:00',
          endTime: '12:00'
        },
        {
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '14:00',
          endTime: '17:00'
        },
        {
          daysOfWeek: [6], // Saturday
          startTime: '08:00',
          endTime: '12:00'
        }
      ],
      events: [],
      eventClick: this.handleEventClick.bind(this),
      allDaySlot: false,
      height: 'auto',
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      dayCellClassNames: (arg) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of today
        return arg.date < today ? ['fc-day-past'] : [];
      }
    };
  }

  ngOnInit(): void {
    this.authService.userRole$.subscribe({
      next: (role) => {
        if (role !== 'doctor') {
          this.errorMessage = 'You must be logged in as a doctor to view appointments';
          this.isLoading = false;
          this.router.navigate(['/login']);
          return;
        }

        this.authService.userId$.subscribe({
          next: (doctorId) => {
            if (!doctorId) {
              this.errorMessage = 'Doctor ID not found. Please log in again.';
              this.isLoading = false;
              this.router.navigate(['/login']);
              return;
            }
            this.loadAppointments(doctorId);
          },
          error: (err) => {
            this.errorMessage = 'Error retrieving doctor ID. Please log in again.';
            this.isLoading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Error checking user role. Please log in again.';
        this.isLoading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  loadAppointments(doctorId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.appointmentService.getAppointmentsByDoctor(doctorId).subscribe({
      next: (appointments) => {
        console.log('Appointments received:', appointments);
        
        // Normalize dates - handle both API response formats
        const normalizedAppointments = appointments.map(app => ({
          ...app,
          date: new Date(app.date),
          // Ensure we have the correct property names for our interface
          patient: app.patient ,
          doctor: app.doctor 
        }));

        // Resolve patient information for each appointment
        this.resolvePatientInformation(normalizedAppointments);
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.errorMessage = err.message || 'Failed to load appointments';
        this.isLoading = false;
      }
    });
  }

  private resolvePatientInformation(appointments: any[]): void {
    if (appointments.length === 0) {
      this.appointments = [];
      this.updateCalendarEvents();
      this.isLoading = false;
      return;
    }

    // Create observables for patient resolution
    const patientObservables: Observable<Appointment>[] = appointments.map(app => {
      // Get patient ID from either patientId or patient property
      let patientId: number;
      if (app.patientId) {
        patientId = app.patientId;
      } else if (typeof app.patient === 'number') {
        patientId = app.patient;
      } else if (this.isPatientUser(app.patient)) {
        // Patient is already a User object
        return of({
          ...app,
          patient: app.patient,
          doctor: app.doctor || app.doctorId
        } as Appointment);
      } else {
        // No valid patient ID found
        console.error('No valid patient ID found for appointment:', app);
        return of({
          ...app,
          patient: app.patientId || app.patient,
          doctor: app.doctor || app.doctorId
        } as Appointment);
      }
      
      // Fetch patient details using the ID
      return this.userService.getUserById(patientId).pipe(
        map((patient: User) => ({
          ...app,
          patient: patient,
          doctor: app.doctor || app.doctorId
        } as Appointment)),
        catchError(error => {
          console.error(`Error loading patient ${patientId}:`, error);
          // Return appointment with patient ID if user fetch fails
          return of({
            ...app,
            patient: patientId,
            doctor: app.doctor || app.doctorId
          } as Appointment);
        })
      );
    });

    // Execute all patient resolution requests
    forkJoin(patientObservables).subscribe({
      next: (resolvedAppointments) => {
        console.log('Resolved appointments:', resolvedAppointments);
        this.appointments = resolvedAppointments;
        this.updateCalendarEvents();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error resolving patient information:', err);
        this.errorMessage = 'Failed to load patient information';
        this.isLoading = false;
      }
    });
  }

  updateCalendarEvents(): void {
    const events: EventInput[] = this.appointments.map(appointment => ({
      id: appointment.id?.toString(),
      title: this.getEventTitle(appointment),
      start: new Date(appointment.date),
      end: new Date(new Date(appointment.date).getTime() + 30 * 60 * 1000),
      color: appointment.status === 'CONFIRMED' ? '#dc3545' : '#ffc107',
      editable: false
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  handleEventClick(info: EventClickArg): void {
    const appointmentId = Number(info.event.id);
    this.selectedAppointment = this.appointments.find(app => app.id === appointmentId) || null;
    
    if (!this.selectedAppointment) {
      this.errorMessage = 'Appointment not found';
    } else {
      console.log('Selected appointment:', this.selectedAppointment);
    }
  }

  confirmAppointment(): void {
    if (!this.selectedAppointment?.id) {
      this.errorMessage = 'No appointment selected';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = null;

    this.appointmentService.confirmAppointment(this.selectedAppointment.id).subscribe({
      next: (updatedAppointment) => {
        console.log('Appointment confirmed:', updatedAppointment);
        
        // Resolve patient information for the updated appointment
        this.resolvePatientForUpdatedAppointment(updatedAppointment);
      },
      error: (err) => {
        console.error('Error confirming appointment:', err);
        let errorMsg = 'Failed to confirm appointment';
        if (err.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
          this.router.navigate(['/login']);
        } else if (err.status === 400 && err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
        this.errorMessage = errorMsg;
        this.isProcessing = false;
      }
    });
  }

  private resolvePatientForUpdatedAppointment(updatedAppointment: any): void {
    // Get patient ID from either patientId or patient property
    let patientId: number;
    if (updatedAppointment.patientId) {
      patientId = updatedAppointment.patientId;
    } else if (typeof updatedAppointment.patient === 'number') {
      patientId = updatedAppointment.patient;
    } else if (this.isPatientUser(updatedAppointment.patient)) {
      // Patient is already a User object
      const resolvedAppointment = { 
        ...updatedAppointment, 
        patient: updatedAppointment.patient, 
        doctor: updatedAppointment.doctor || updatedAppointment.doctorId,
        date: new Date(updatedAppointment.date) 
      };
      
      this.appointments = this.appointments.map(app =>
        app.id === resolvedAppointment.id ? resolvedAppointment : app
      );
      
      this.updateCalendarEvents();
      this.selectedAppointment = null;
      this.isProcessing = false;
      alert('Appointment confirmed successfully');
      return;
    } else {
      console.error('No valid patient ID found for updated appointment:', updatedAppointment);
      this.errorMessage = 'Failed to process updated appointment';
      this.isProcessing = false;
      return;
    }

    // Fetch patient details
    this.userService.getUserById(patientId).subscribe({
      next: (patient) => {
        const resolvedAppointment = { 
          ...updatedAppointment, 
          patient: patient, 
          doctor: updatedAppointment.doctor || updatedAppointment.doctorId,
          date: new Date(updatedAppointment.date) 
        };
        
        // Update the appointment in the list
        this.appointments = this.appointments.map(app =>
          app.id === resolvedAppointment.id ? resolvedAppointment : app
        );
        
        this.updateCalendarEvents();
        this.selectedAppointment = null;
        this.isProcessing = false;
        alert('Appointment confirmed successfully');
      },
      error: (err) => {
        console.error('Error resolving patient after confirmation:', err);
        this.errorMessage = 'Failed to load patient information after confirmation';
        this.isProcessing = false;
      }
    });
  }

  deleteAppointment(): void {
    if (!this.selectedAppointment?.id) {
      this.errorMessage = 'No appointment selected';
      return;
    }

    if (confirm('Are you sure you want to delete this appointment?')) {
      this.isProcessing = true;
      this.errorMessage = null;

      this.appointmentService.deleteAppointment(this.selectedAppointment.id).subscribe({
        next: () => {
          console.log('Appointment deleted successfully');
          this.appointments = this.appointments.filter(app => app.id !== this.selectedAppointment!.id);
          this.updateCalendarEvents();
          this.selectedAppointment = null;
          this.isProcessing = false;
          alert('Appointment deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting appointment:', err);
          let errorMsg = 'Failed to delete appointment';
          if (err.status === 401) {
            errorMsg = 'Authentication failed. Please log in again.';
            this.router.navigate(['/login']);
          } else if (err.status === 404) {
            errorMsg = 'Appointment not found.';
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.message) {
            errorMsg = err.message;
          }
          this.errorMessage = errorMsg;
          this.isProcessing = false;
        }
      });
    }
  }

  getEndTime(date: Date | string): Date {
    const startDate = typeof date === 'string' ? new Date(date) : date;
    return new Date(startDate.getTime() + 30 * 60 * 1000);
  }

  isPatientUser(patient: User | number): patient is User {
    return typeof patient === 'object' && patient !== null && 'id' in patient;
  }

  getEventTitle(appointment: Appointment): string {
    if (this.isPatientUser(appointment.patient)) {
      const nom = appointment.patient.nom || 'Unknown';
      const prenom = appointment.patient.prenom || '';
      return `${nom} ${prenom} (${appointment.status})`.trim();
    }
    return `Patient ID: ${appointment.patient} (${appointment.status})`;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}