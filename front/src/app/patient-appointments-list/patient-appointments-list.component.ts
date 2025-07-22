import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/services/UserService.service';
import { Appointment } from 'src/models/Appointment.model';
import { User } from 'src/models/User.model';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';
import { AppointmentService } from 'src/services/AppointmentService.service';
import { AuthServiceService } from 'src/services/auth-service.service';
import { OrdonnanceService } from 'src/services/OrdonnanceService.service';
import { OrdonnanceModalComponent } from '../ordonnance-modal/ordonnance-modal.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-patient-appointments-list',
  templateUrl: './patient-appointments-list.component.html',
  styleUrls: ['./patient-appointments-list.component.css']
})
export class PatientAppointmentsListComponent implements OnInit {
  @Input() patientId?: number; // Made optional to allow fallback to auth

  appointmentsList: { doctor: User, appointments: Appointment[] }[] = [];
  loading = false;
  error: string | null = null;
  expandedDoctors: Set<number> = new Set();
  patientName: string | null = null;

  private currentUserId: number | null = null;


  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService,
    private ordonnanceService: OrdonnanceService,
    private authService: AuthServiceService,
    private dialog: MatDialog

  ) { }

  ngOnInit(): void {
    // Get current user ID from AuthService
    this.authService.userId$.pipe(take(1)).subscribe(userId => {
      this.currentUserId = userId;
      // Use provided patientId if valid, otherwise fallback to currentUserId
      const effectivePatientId = this.patientId && !isNaN(this.patientId) && this.patientId > 0
        ? this.patientId
        : this.currentUserId;

      if (!effectivePatientId || isNaN(effectivePatientId) || effectivePatientId <= 0) {
        this.error = 'Identifiant du patient non valide ou utilisateur non connecté';
        return;
      }

      this.loadAppointmentsList(effectivePatientId);

    });
    this.authService.userName$.subscribe(userName => {
      this.patientName = userName;
    });

  }

  loadAppointmentsList(patientId: number): void {
    this.loading = true;
    this.error = null;

    // Ensure patientId is a valid number
    if (isNaN(patientId) || patientId <= 0) {
      this.error = 'Identifiant du patient non valide';
      this.loading = false;
      return;
    }

    this.appointmentService.getAppointmentsByPatient(patientId).pipe(
      switchMap((appointments: Appointment[]) => {
        // Group appointments by doctor
        const doctorAppointmentsMap = new Map<number, Appointment[]>();

        appointments.forEach(appointment => {
          const doctorId = appointment.doctorId;
          if (doctorId) {
            if (!doctorAppointmentsMap.has(doctorId)) {
              doctorAppointmentsMap.set(doctorId, []);
            }
            doctorAppointmentsMap.get(doctorId)!.push(appointment);
          }
        });

        // Fetch unique doctor information
        const doctorIds = Array.from(doctorAppointmentsMap.keys());
        if (doctorIds.length === 0) {
          return of([]);
        }

        const doctorRequests = doctorIds.map(id => this.userService.getUserById(id));

        return forkJoin(doctorRequests).pipe(
          map(doctors => {
            return doctors.map(doctor => ({
              doctor: doctor,
              appointments: doctorAppointmentsMap.get(doctor.id!) || []
            }));
          })
        );
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous du patient:', error);
        this.error = error.message || 'Erreur lors de la récupération des rendez-vous du patient';
        return of([]);
      })
    ).subscribe({
      next: (result) => {
        this.appointmentsList = result.map(item => ({
          ...item,
          appointments: item.appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }));
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors de la récupération des rendez-vous';
        this.loading = false;
      }
    });
  }

  toggleDoctorExpansion(doctorId: number): void {
    if (this.expandedDoctors.has(doctorId)) {
      this.expandedDoctors.delete(doctorId);
    } else {
      this.expandedDoctors.add(doctorId);
    }
  }

  isDoctorExpanded(doctorId: number): boolean {
    return this.expandedDoctors.has(doctorId);
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/default-profile.png';
    const parts = imagePath.split('assets\\images\\');
    if (parts.length > 1) {
      return `assets/images/${parts[1]}`;
    }
    return imagePath;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  openOrdonnanceModal(ordonnanceId: number | null): void {
    this.dialog.open(OrdonnanceModalComponent, {
      width: '600px',
      data: { ordonnanceId }
    });
  }


  cancelAppointment(appointmentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      this.appointmentService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.loadAppointmentsList(this.patientId || this.currentUserId!);
          console.log('Rendez-vous annulé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation:', error);
          alert('Erreur lors de l\'annulation du rendez-vous');
        }
      });
    }
  }

  getTotalAppointments(): number {
    return this.appointmentsList.reduce((total, doctorData) => total + doctorData.appointments.length, 0);
  }

  getConfirmedAppointments(): number {
    return this.appointmentsList.reduce((total, doctorData) =>
      total + doctorData.appointments.filter(apt => apt.status === 'CONFIRMED').length, 0);
  }

  getPendingAppointments(): number {
    return this.appointmentsList.reduce((total, doctorData) =>
      total + doctorData.appointments.filter(apt => apt.status === 'PENDING').length, 0);
  }
}