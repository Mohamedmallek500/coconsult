import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { User } from 'src/models/User.model';
import { Appointment, AppointmentRequest } from 'src/models/Appointment.model';
import { AuthServiceService } from 'src/services/auth-service.service';
import { AppointmentService } from 'src/services/AppointmentService.service';
import { UserService } from 'src/services/UserService.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.css']
})
export class AppointmentBookingComponent implements OnInit {
  doctor: User | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  calendarOptions: CalendarOptions;
  selectedSlot: { start: Date; end: Date } | null = null;
  isBooking = false;
  currentUser: User | null = null;
  doctorId: number | null = null;

  private baseUrl = 'http://localhost:9090/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthServiceService,
    private appointmentService: AppointmentService,
    private userService: UserService
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
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '14:00',
          endTime: '17:00'
        }
      ],
      events: [],
      eventClick: this.handleEventClick.bind(this),
      dateClick: this.handleDateClick.bind(this),
      allDaySlot: false,
      height: 'auto',
      eventColor: '#dc3545', // Red for booked appointments
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    };
  }

  ngOnInit(): void {
    const doctorIdParam = this.route.snapshot.paramMap.get('id');
    console.log('Doctor ID from route:', doctorIdParam);
    
    if (doctorIdParam && !isNaN(+doctorIdParam)) {
      this.doctorId = +doctorIdParam;
      this.loadData(this.doctorId);
    } else {
      this.errorMessage = 'Invalid doctor ID';
      this.isLoading = false;
    }
  }

  loadData(doctorId: number): void {
    console.log('Loading data for doctor ID:', doctorId);
    
    this.userService.getUserById(doctorId).subscribe({
      next: (doctor) => {
        console.log('Doctor loaded:', doctor);
        this.doctor = doctor;
        
        this.authService.userRole$.subscribe({
          next: (role) => {
            console.log('User role:', role);
            
            if (role === 'patient') {
              this.authService.userId$.subscribe({
                next: (userId) => {
                  console.log('Current user ID:', userId);
                  
                  if (!userId) {
                    this.errorMessage = 'User ID not found. Please log in again.';
                    this.isLoading = false;
                    this.router.navigate(['/login']);
                    return;
                  }
                  
                  forkJoin([
                    this.userService.getUserById(userId),
                    this.appointmentService.getAppointmentsByDoctor(doctorId)
                  ]).subscribe({
                    next: ([currentUser, appointments]) => {
                      console.log('Current user:', currentUser);
                      console.log('Appointments:', appointments);
                      
                      this.currentUser = currentUser;
                      
                      const events: EventInput[] = appointments.map(appointment => ({
                        title: 'Booked',
                        start: new Date(appointment.date),
                        end: new Date(new Date(appointment.date).getTime() + 30 * 60 * 1000),
                        editable: false
                      }));
                      
                      this.calendarOptions = {
                        ...this.calendarOptions,
                        events: events
                      };
                      
                      this.isLoading = false;
                    },
                    error: (err) => {
                      console.error('Error loading user or appointments:', err);
                      this.errorMessage = err.message || 'Failed to load user or appointments';
                      this.isLoading = false;
                    }
                  });
                },
                error: (err) => {
                  console.error('Error getting user ID:', err);
                  this.errorMessage = 'Error retrieving user ID. Please log in again.';
                  this.isLoading = false;
                  this.router.navigate(['/login']);
                }
              });
            } else {
              this.errorMessage = 'You must be logged in as a patient to book an appointment';
              this.isLoading = false;
              this.router.navigate(['/login']);
            }
          },
          error: (err) => {
            console.error('Error checking user role:', err);
            this.errorMessage = 'Error checking user role. Please log in again.';
            this.isLoading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        console.error('Error loading doctor:', err);
        this.errorMessage = 'Failed to load doctor information';
        this.isLoading = false;
      }
    });
  }

  handleDateClick(info: any): void {
    const start = new Date(info.dateStr);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const isBusinessHour = this.isWithinBusinessHours(start);

    console.log('Date clicked:', { start, end, isBusinessHour });

    if (isBusinessHour && !this.isSlotBooked(start)) {
      this.selectedSlot = { start, end };
      this.errorMessage = null;
    } else {
      this.errorMessage = 'Selected time is outside doctor\'s working hours or already booked';
      this.selectedSlot = null;
    }
  }

  handleEventClick(): void {
    this.errorMessage = 'This slot is already booked';
    this.selectedSlot = null;
  }

  isWithinBusinessHours(date: Date): boolean {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDay();
    
    return (
      day >= 1 &&
      day <= 5 &&
      ((hours >= 8 && hours < 12) || (hours >= 14 && hours < 17)) &&
      minutes % 30 === 0
    );
  }

  isSlotBooked(start: Date): boolean {
    const events = this.calendarOptions.events as EventInput[];
    console.log('Checking slot:', start, 'against events:', events);
    return events.some(event => {
      const eventStart = new Date(event.start as string | Date);
      return eventStart.getTime() === start.getTime();
    });
  }

bookAppointment(): void {
  console.log('Booking attempt:', {
    selectedSlot: this.selectedSlot,
    doctorId: this.doctor?.id,
    patientId: this.currentUser?.id
  });

  if (!this.selectedSlot || !this.doctor?.id || !this.currentUser?.id) {
    this.errorMessage = 'Please select a valid slot and ensure you are logged in';
    this.isBooking = false;
    return;
  }

  this.isBooking = true;
  this.errorMessage = null;

  const formattedDate = this.formatDateForBackend(this.selectedSlot.start);
  const appointmentData: AppointmentRequest = {
    doctorId: this.doctor.id,
    patientId: this.currentUser.id,
    date: formattedDate
  };

  console.log('Sending appointment data:', JSON.stringify(appointmentData, null, 2));

  this.appointmentService.createAppointment(appointmentData).subscribe({
    next: (response) => {
      console.log('Booking response:', response);
      this.handleBookingSuccess(response.body);
    },
    error: (err) => {
      console.error('Booking error:', err);
      this.handleBookingError(err);
      if (err.status === 401) {
        this.errorMessage = 'Session expired. Please log in again.';
        this.router.navigate(['/login']);
      }
    }
  });
}

  private formatDateForBackend(date: Date): string {
    // Use ISO 8601 format with milliseconds to match backend expectations
    return date.toISOString(); // e.g., "2025-07-10T10:00:00.000Z"
  }

  private handleBookingSuccess(appointment: any): void {
    const newEvent = {
      title: 'Booked',
      start: this.selectedSlot!.start,
      end: this.selectedSlot!.end,
      editable: false,
      color: '#dc3545'
    };

    this.calendarOptions.events = [...(this.calendarOptions.events as EventInput[]), newEvent];
    
    this.selectedSlot = null;
    this.isBooking = false;
    
    alert(`Appointment booked for ${new Date(appointment.date).toLocaleString()}`);
  }

  private handleBookingError(error: any): void {
    this.isBooking = false;
    
    let errorMsg = 'Failed to book appointment';
    if (error.status === 0) {
      errorMsg = 'Could not connect to server. Please verify the backend is running on port 9090 and check your network connection.';
    } else if (error.status === 401) {
      errorMsg = 'Authentication failed. Please log in again.';
    } else if (error.status === 400 && error.error?.message) {
      errorMsg = error.error.message;
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    this.errorMessage = errorMsg;
    console.error('Error details:', error);
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/default-doctor.jpg';
    const parts = imagePath.split('assets\\images\\');
    if (parts.length > 1) {
      return `assets/images/${parts[1]}`;
    }
    return imagePath;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}