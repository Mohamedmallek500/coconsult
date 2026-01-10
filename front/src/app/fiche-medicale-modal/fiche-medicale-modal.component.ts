import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { User } from 'src/models/User.model';
import { Appointment } from 'src/models/Appointment.model';
import { Maladie } from 'src/models/Maladie.model';
import { Ordonnance } from 'src/models/Ordonnance.model';
import { UserService } from 'src/services/UserService.service';
import { AppointmentService } from 'src/services/AppointmentService.service';
import { MaladieService } from 'src/services/MaladieService.service';
import { OrdonnanceService } from 'src/services/OrdonnanceService.service';
import { AuthServiceService } from 'src/services/auth-service.service';
import { OrdonnanceModalComponent } from '../ordonnance-modal/ordonnance-modal.component';
import { forkJoin, throwError } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-fiche-medicale-modal',
  templateUrl: './fiche-medicale-modal.component.html',
  styleUrls: ['./fiche-medicale-modal.component.css']
})
export class FicheMedicaleModalComponent implements OnInit {
  patient: User | null = null;
  appointments: Appointment[] = [];
  maladies: Maladie[] = [];
  ordonnances: Ordonnance[] = [];
  loading = true;
  error: string | null = null;
  doctorId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<FicheMedicaleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: number },
    private userService: UserService,
    private appointmentService: AppointmentService,
    private maladieService: MaladieService,
    private ordonnanceService: OrdonnanceService,
    private authService: AuthServiceService,
    private dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to the doctor's ID from AuthService
    this.authService.userId$.subscribe(userId => {
      this.doctorId = userId;
      this.loadPatientData();
    });
  }

  loadPatientData(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUserById(this.data.patientId).pipe(
      catchError(error => {
        this.error = 'Failed to load patient data. Please try again later.';
        console.error('Error loading patient:', error);
        return throwError(() => error);
      }),
      finalize(() => this.loading = false)
    ).subscribe(patient => {
      this.patient = patient;
      this.loadAdditionalData();
    });
  }

  private loadAdditionalData(): void {
    if (!this.patient || !this.doctorId) return;

    const requests = [];

    // Charger les rendez-vous du patient avec ce médecin uniquement
    requests.push(
      this.appointmentService.getAppointmentsByDoctor(this.doctorId).pipe(
        map(appointments => appointments.filter(appointment => appointment.patientId === this.patient!.id))
      )
    );

    // Charger les maladies si le patient en a
    if (this.patient.dossierfile && this.patient.dossierfile.length > 0) {
      const maladieRequests = this.patient.dossierfile
        .filter(item => typeof item === 'number')
        .map(maladieId => this.maladieService.getMaladieById(maladieId as number));
      
      if (maladieRequests.length > 0) {
        requests.push(forkJoin(maladieRequests));
      } else {
        requests.push(Promise.resolve([]));
      }
    } else {
      requests.push(Promise.resolve([]));
    }

    forkJoin(requests).subscribe({
      next: (results) => {
        this.appointments = results[0] as Appointment[];
        this.maladies = results[1] as Maladie[];
        
        // Charger les ordonnances pour chaque rendez-vous qui en a une
        this.loadOrdonnances();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données additionnelles:', error);
        this.loading = false;
      }
    });
  }

  private loadOrdonnances(): void {
    const ordonnanceIds = this.appointments
      .filter(appointment => appointment.ordonnanceId)
      .map(appointment => appointment.ordonnanceId!);

    if (ordonnanceIds.length === 0) {
      this.loading = false;
      return;
    }

    const ordonnanceRequests = ordonnanceIds.map(id => 
      this.ordonnanceService.getOrdonnanceById(id)
    );

    forkJoin(ordonnanceRequests).subscribe({
      next: (ordonnances) => {
        this.ordonnances = ordonnances;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ordonnances:', error);
        this.loading = false;
      }
    });
  }

  openOrdonnanceModal(ordonnanceId: number): void {
    this.dialog.open(OrdonnanceModalComponent, {
      width: '600px',
      data: { ordonnanceId }
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

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'PENDING':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PENDING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getAge(): number | null {
    if (!this.patient?.dateNaissance) return null;
    
    const birthDate = new Date(this.patient.dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getOrdonnanceForAppointment(appointmentId: number): Ordonnance | null {
    const appointment = this.appointments.find(a => a.id === appointmentId);
    if (!appointment?.ordonnanceId) return null;
    
    return this.ordonnances.find(o => o.id === appointment.ordonnanceId) || null;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}