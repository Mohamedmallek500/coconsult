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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  patientAppointments: Appointment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthServiceService,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private modalService: NgbModal
  ) {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      slotDuration: '00:30:00',
      slotMinTime: '08:00:00',
      slotMaxTime: '17:00:00',
      businessHours: [
        {
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '12:00'
        },
        {
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '14:00',
          endTime: '17:00'
        },
        {
          daysOfWeek: [6],
          startTime: '08:00',
          endTime: '12:00'
        }
      ],
      events: [],
      eventClick: this.handleEventClick.bind(this),
      dateClick: this.handleDateClick.bind(this),
      allDaySlot: false,
      height: 'auto',
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      dayCellClassNames: (arg) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return arg.date < today ? ['fc-day-past'] : [];
      }
    };
  }

  ngOnInit(): void {
    const doctorIdParam = this.route.snapshot.paramMap.get('id');
    if (doctorIdParam && !isNaN(+doctorIdParam)) {
      this.doctorId = +doctorIdParam;
      this.loadData(this.doctorId);
    } else {
      this.errorMessage = 'Invalid doctor ID';
      this.isLoading = false;
    }
  }

  loadData(doctorId: number): void {
    this.userService.getUserById(doctorId).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.authService.userRole$.subscribe({
          next: (role) => {
            if (role === 'patient') {
              this.authService.userId$.subscribe({
                next: (userId) => {
                  if (!userId) {
                    this.errorMessage = 'User ID not found. Please log in again.';
                    this.isLoading = false;
                    this.router.navigate(['/login']);
                    return;
                  }

                  forkJoin([
                    this.userService.getUserById(userId),
                    this.appointmentService.getAppointmentsByDoctor(doctorId),
                    this.appointmentService.getAppointmentsByPatient(userId)
                  ]).subscribe({
                    next: ([currentUser, doctorAppointments, patientAppointments]) => {
                      this.currentUser = currentUser;
                      this.patientAppointments = patientAppointments.filter(app => app.doctorId === doctorId);

                      const events: EventInput[] = [];

                      const confirmedAppointments = doctorAppointments.filter(appointment => appointment.status === 'CONFIRMED');
                      events.push(...confirmedAppointments.map(appointment => ({
                        title: 'Booked',
                        start: new Date(appointment.date),
                        end: new Date(new Date(appointment.date).getTime() + 30 * 60 * 1000),
                        color: '#dc3545',
                        editable: false
                      })));

                      const patientPendingAppointments = this.patientAppointments.filter(appointment => appointment.status === 'PENDING');
                      events.push(...patientPendingAppointments.map(appointment => ({
                        title: 'Your Pending Appointment',
                        start: new Date(appointment.date),
                        end: new Date(new Date(appointment.date).getTime() + 30 * 60 * 1000),
                        color: '#ffc107',
                        editable: false
                      })));

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
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if the selected date is in the past
  if (start < today) {
    this.errorMessage = 'Cannot book appointments for past dates';
    return;
  }

  // Check if the selected time is in the past on the current day
  if (start.toDateString() === now.toDateString() && start <= now) {
    this.errorMessage = 'Cannot book appointments for past times on the current day';
    return;
  }

  const isBusinessHour = this.isWithinBusinessHours(start);
  if (isBusinessHour && !this.isSlotBooked(start)) {
    this.selectedSlot = { start, end };
    this.errorMessage = null;
    this.openModal();
  } else {
    this.errorMessage = 'Selected time is outside doctor\'s working hours or already booked';
  }
}

  handleEventClick(info: any): void {
    const eventStart = new Date(info.event.start);
    const isPending = info.event.extendedProps?.status === 'PENDING';

    if (isPending) {
      this.errorMessage = 'You already have a pending appointment at this time';
    } else {
      this.errorMessage = 'This slot is already booked';
    }
  }

  openModal() {
    const modalElement = document.getElementById('appointmentModal');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  }

  closeModal() {
    const modalElement = document.getElementById('appointmentModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
    this.selectedSlot = null;
  }

  isWithinBusinessHours(date: Date): boolean {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDay();

    if (day === 0) return false;

    return (
      ((day >= 1 && day <= 5) &&
        ((hours >= 8 && hours < 12) || (hours >= 14 && hours < 17)) ||
      (day === 6 && hours >= 8 && hours < 12)) &&
      minutes % 30 === 0
    );
  }

  isSlotBooked(start: Date): boolean {
    const events = this.calendarOptions.events as EventInput[];
    return events.some(event => {
      const eventStart = new Date(event.start as string | Date);
      return eventStart.getTime() === start.getTime() && event.color === '#dc3545';
    });
  }

  bookAppointment(): void {
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
      date: formattedDate,
      status: 'PENDING'
    };

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        this.handleBookingSuccess(response.body);
        this.closeModal();
      },
      error: (err) => {
        this.handleBookingError(err);
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please log in again.';
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private handleBookingSuccess(appointment: any): void {
    const newAppointment: Appointment = {
      ...appointment,
      date: new Date(appointment.date),
      patient: this.currentUser!,
      doctor: this.doctor!,
      status: 'PENDING'
    };

    this.patientAppointments = [...this.patientAppointments, newAppointment];

    const newEvent: EventInput = {
      title: 'Your Pending Appointment',
      start: this.selectedSlot!.start,
      end: this.selectedSlot!.end,
      color: '#ffc107',
      editable: false,
      extendedProps: { status: 'PENDING' }
    };

    this.calendarOptions.events = [...(this.calendarOptions.events as EventInput[]), newEvent];

    this.selectedSlot = null;
    this.isBooking = false;

    alert(`Appointment booked for ${new Date(appointment.date).toLocaleString()} (Pending approval)`);
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