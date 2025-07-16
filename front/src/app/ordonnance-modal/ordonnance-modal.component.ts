import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ordonnance } from 'src/models/Ordonnance.model';
import { OrdonnanceService } from 'src/services/OrdonnanceService.service';
import { UserService } from 'src/services/UserService.service';


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
    private userService: UserService
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
      next: (ordonnance) => {
        // Fetch patient and doctor details concurrently
        const patientRequest = ordonnance.patientId
          ? this.userService.getUserById(ordonnance.patientId).pipe(
              catchError(() => of(null)) // Handle user fetch failure gracefully
            )
          : of(null);
        const doctorRequest = ordonnance.doctorId
          ? this.userService.getUserById(ordonnance.doctorId).pipe(
              catchError(() => of(null)) // Handle user fetch failure gracefully
            )
          : of(null);

        forkJoin({
          patient: patientRequest,
          doctor: doctorRequest
        }).subscribe({
          next: ({ patient, doctor }) => {
            this.ordonnance = {
              ...ordonnance,
              patient: patient || undefined,
              doctor: doctor || undefined,
              medicaments: ordonnance.medicaments || [] // Ensure medicaments is an array
            };
            this.loading = false;
          },
          error: (err) => {
            this.error = err.message || 'Erreur lors de la récupération des informations de l\'utilisateur';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err.message || 'Échec de la récupération de l\'ordonnance';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}