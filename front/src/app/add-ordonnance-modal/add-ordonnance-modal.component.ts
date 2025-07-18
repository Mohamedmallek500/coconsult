import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdonnanceService } from 'src/services/OrdonnanceService.service';
import { MedicamentService } from 'src/services/MedicamentService.service';
import { Medicament } from 'src/models/Medicament.model';
import { Ordonnance } from 'src/models/Ordonnance.model';

interface DialogData {
  ordonnanceId: number;
  patientId: number;
  doctorId: number;
}

@Component({
  selector: 'app-add-ordonnance-modal',
  templateUrl: './add-ordonnance-modal.component.html',
  styleUrls: ['./add-ordonnance-modal.component.css']
})
export class AddOrdonnanceModalComponent implements OnInit {
  medicaments: Medicament[] = [];
  selectedMedicamentIds: number[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<AddOrdonnanceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ordonnanceService: OrdonnanceService,
    private medicamentService: MedicamentService
  ) {}

  ngOnInit(): void {
    this.loadMedicaments();
    this.loadCurrentOrdonnance();
  }

  loadMedicaments(): void {
    this.medicamentService.getAllMedicaments().subscribe({
      next: (medicaments) => {
        this.medicaments = medicaments;
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  loadCurrentOrdonnance(): void {
    this.ordonnanceService.getOrdonnanceById(this.data.ordonnanceId).subscribe({
      next: (ordonnance) => {
        this.selectedMedicamentIds = ordonnance.medicamentIds || [];
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  updateOrdonnance(): void {
    if (this.selectedMedicamentIds.length === 0) {
      this.error = 'Veuillez sélectionner au moins un médicament';
      return;
    }

    const updatedOrdonnance: Ordonnance = {
      id: this.data.ordonnanceId,
      patientId: this.data.patientId,
      doctorId: this.data.doctorId,
      medicamentIds: this.selectedMedicamentIds,
      medicaments: []
    };

    this.loading = true;
    this.error = null;

    this.ordonnanceService.updateOrdonnance(this.data.ordonnanceId, updatedOrdonnance).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  toggleMedicamentSelection(medicamentId: number): void {
    if (this.selectedMedicamentIds.includes(medicamentId)) {
      this.selectedMedicamentIds = this.selectedMedicamentIds.filter(id => id !== medicamentId);
    } else {
      this.selectedMedicamentIds.push(medicamentId);
    }
  }
}