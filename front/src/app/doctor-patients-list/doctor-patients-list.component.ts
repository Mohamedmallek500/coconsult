import { Component, OnInit } from '@angular/core';
import { Appointment } from 'src/models/Appointment.model';
import { User } from 'src/models/User.model';
import { AppointmentService } from 'src/services/AppointmentService.service';
import { AuthServiceService } from 'src/services/auth-service.service';
import { UserService } from 'src/services/UserService.service';
import { OrdonnanceModalComponent } from '../ordonnance-modal/ordonnance-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AddOrdonnanceModalComponent } from '../add-ordonnance-modal/add-ordonnance-modal.component';
import { FicheMedicaleModalComponent } from '../fiche-medicale-modal/fiche-medicale-modal.component';

interface PatientWithAppointments {
  patient: User;
  appointments: Appointment[];
  appointmentCount: number;
}

@Component({
  selector: 'app-doctor-patients-list',
  templateUrl: './doctor-patients-list.component.html',
  styleUrls: ['./doctor-patients-list.component.css']
})
export class DoctorPatientsListComponent implements OnInit {
  patientsList: PatientWithAppointments[] = [];
  loading = false;
  error: string | null = null;
  doctorId: number | null = null;
  doctorName: string | null = null;
  expandedPatients: Set<number> = new Set();

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthServiceService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.userId$.subscribe(userId => {
      if (userId) {
        this.doctorId = userId;
        this.loadPatientsList();
      }
    });
    this.authService.userName$.subscribe(userName => {
      this.doctorName = userName;
    });
  }

  loadPatientsList(): void {
    if (!this.doctorId) {
      this.error = 'ID du médecin non trouvé';
      return;
    }

    this.loading = true;
    this.error = null;

    this.appointmentService.getAppointmentsByDoctor(this.doctorId).subscribe({
      next: (appointments: Appointment[]) => {
        this.processAppointments(appointments);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  private processAppointments(appointments: Appointment[]): void {
    // Convertir les chaînes de date en objets Date et filtrer les rendez-vous CANCELLED
    const normalizedAppointments = appointments
      .filter(appointment => appointment.status !== 'CANCELLED')
      .map(appointment => ({
        ...appointment,
        date: typeof appointment.date === 'string' ? new Date(appointment.date) : appointment.date
      }));

    // Grouper les rendez-vous par patient
    const patientAppointmentsMap = new Map<number, Appointment[]>();
    
    normalizedAppointments.forEach(appointment => {
      const patientId = appointment.patientId;
      if (patientId) {
        if (!patientAppointmentsMap.has(patientId)) {
          patientAppointmentsMap.set(patientId, []);
        }
        patientAppointmentsMap.get(patientId)!.push(appointment);
      }
    });

    // Récupérer les informations des patients
    const patientIds = Array.from(patientAppointmentsMap.keys());
    const patientRequests = patientIds.map(id => 
      this.userService.getUserById(id).toPromise()
    );

    Promise.all(patientRequests).then(patients => {
      this.patientsList = patients.map(patient => {
        const patientAppointments = patientAppointmentsMap.get(patient!.id!) || [];
        
        // Trier les rendez-vous par date (plus récent en premier)
        patientAppointments.sort((a, b) => 
          b.date.getTime() - a.date.getTime()
        );

        return {
          patient: patient!,
          appointments: patientAppointments,
          appointmentCount: patientAppointments.length
        };
      });

      // Trier les patients par nombre de rendez-vous (plus actifs en premier)
      this.patientsList.sort((a, b) => b.appointmentCount - a.appointmentCount);
      
      this.loading = false;
    }).catch(error => {
      this.error = 'Erreur lors du chargement des informations des patients';
      this.loading = false;
    });
  }

  togglePatientExpansion(patientId: number): void {
    if (this.expandedPatients.has(patientId)) {
      this.expandedPatients.delete(patientId);
    } else {
      this.expandedPatients.add(patientId);
    }
  }

  isPatientExpanded(patientId: number): boolean {
    return this.expandedPatients.has(patientId);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PENDING':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  }

  formatDate(date: string | Date): string {
    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide'; // Handle invalid dates
    }

    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  confirmAppointment(appointmentId: number): void {
    this.appointmentService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        this.loadPatientsList(); // Recharger la liste
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  deleteAppointment(appointmentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.appointmentService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.loadPatientsList(); // Recharger la liste
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  openOrdonnanceModal(ordonnanceId: number | null): void {
    this.dialog.open(OrdonnanceModalComponent, {
      width: '600px',
      data: { ordonnanceId }
    });
  }

  openUpdateOrdonnanceModal(ordonnanceId: number | null, patientId: number, doctorId: number): void {
    this.dialog.open(AddOrdonnanceModalComponent, {
      width: '600px',
      data: { ordonnanceId, patientId, doctorId }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadPatientsList(); // Recharger la liste après la mise à jour
      }
    });
  }

  openFicheMedicaleModal(patientId: number): void {
  this.dialog.open(FicheMedicaleModalComponent, {
    width: '800px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    data: { patientId }
  });
}

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/default-profile.png';
    const parts = imagePath.split('assets\\images\\');
    if (parts.length > 1) {
      return `assets/images/${parts[1]}`;
    }
    return imagePath;
  }
}