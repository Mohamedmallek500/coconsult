import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ordonnance } from 'src/models/Ordonnance.model';
import { Medicament } from 'src/models/Medicament.model';
import { OrdonnanceService } from 'src/services/OrdonnanceService.service';
import { UserService } from 'src/services/UserService.service';
import { MedicamentService } from 'src/services/MedicamentService.service'; // Assurez-vous d'avoir ce service

@Component({
  selector: 'app-ordonnance-modal',
  templateUrl: './ordonnance-modal.component.html',
  styleUrls: ['./ordonnance-modal.component.css']
})
export class OrdonnanceModalComponent implements OnInit {
  ordonnance: Ordonnance | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ordonnanceId: number | null },
    private dialogRef: MatDialogRef<OrdonnanceModalComponent>,
    private ordonnanceService: OrdonnanceService,
    private userService: UserService,
    private medicamentService: MedicamentService // Ajoutez ce service
  ) {}

  ngOnInit(): void {
    this.loadOrdonnance();
  }

  loadOrdonnance(): void {
    if (!this.data.ordonnanceId) {
      this.error = 'Aucune ordonnance associée à ce rendez-vous';
      return;
    }

    this.loading = true;
    this.error = null;

    this.ordonnanceService.getOrdonnanceById(this.data.ordonnanceId).subscribe({
      next: (ordonnanceResponse) => {
        console.log('Ordonnance response:', ordonnanceResponse); // Debug log
        
        // Préparer les requêtes pour récupérer les détails
        const patientRequest = ordonnanceResponse.patientId
          ? this.userService.getUserById(ordonnanceResponse.patientId).pipe(
              catchError(() => of(null))
            )
          : of(null);

        const doctorRequest = ordonnanceResponse.doctorId
          ? this.userService.getUserById(ordonnanceResponse.doctorId).pipe(
              catchError(() => of(null))
            )
          : of(null);

        // Récupérer les médicaments par leurs IDs
        const medicamentRequests = ordonnanceResponse.medicamentIds?.length
          ? ordonnanceResponse.medicamentIds.map(id => 
              this.medicamentService.getMedicamentById(id).pipe(
                catchError(() => of(null))
              )
            )
          : [];

        // Exécuter toutes les requêtes en parallèle
        forkJoin({
          patient: patientRequest,
          doctor: doctorRequest,
          medicaments: medicamentRequests.length > 0 ? forkJoin(medicamentRequests) : of([])
        }).subscribe({
          next: ({ patient, doctor, medicaments }) => {
            // Filtrer les médicaments null (en cas d'erreur de récupération)
            const validMedicaments = medicaments.filter(med => med !== null) as Medicament[];
            
            this.ordonnance = {
              id: ordonnanceResponse.id,
              patientId: ordonnanceResponse.patientId,
              doctorId: ordonnanceResponse.doctorId,
              patient: patient || undefined,
              doctor: doctor || undefined,
              medicaments: validMedicaments
            };
            
            console.log('Final ordonnance:', this.ordonnance); // Debug log
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading ordonnance details:', err);
            this.error = err.message || 'Erreur lors de la récupération des informations';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching ordonnance:', err);
        this.error = err.message || 'Échec de la récupération de l\'ordonnance';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}