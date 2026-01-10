import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Medicament } from 'src/models/Medicament.model';
import { MedicamentService } from 'src/services/MedicamentService.service';

@Component({
  selector: 'app-medicament-management',
  templateUrl: './medicament-management.component.html',
  styleUrls: ['./medicament-management.component.css']
})
export class MedicamentManagementComponent implements OnInit {
  @ViewChild('medicamentFormModal') medicamentFormModal!: TemplateRef<any>;

  medicaments: Medicament[] = [];
  filteredMedicaments: Medicament[] = [];
  medicamentForm: FormGroup;
  filterNomMedicament: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(
    private medicamentService: MedicamentService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.medicamentForm = this.fb.group({
      nomMedicament: ['', [Validators.required, Validators.maxLength(100)]],
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadMedicaments();
  }

  loadMedicaments(): void {
    this.loading = true;
    this.medicamentService.getAllMedicaments().subscribe({
      next: (data) => {
        this.medicaments = data;
        this.filteredMedicaments = [...data]; // Initialize filtered list
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des médicaments';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filteredMedicaments = this.medicaments.filter(medicament =>
      medicament.nomMedicament.toLowerCase().includes(this.filterNomMedicament.toLowerCase())
    );
    this.currentPage = 0; // Reset to first page on filter change
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.medicamentForm.reset();
    this.error = '';
    this.success = '';
    this.modalService.open(this.medicamentFormModal, { ariaLabelledBy: 'modal-title' });
  }

  editMedicament(medicament: Medicament): void {
    this.isEditing = true;
    this.editingId = medicament.id!;
    this.medicamentForm.patchValue({
      nomMedicament: medicament.nomMedicament,
      notes: medicament.notes || ''
    });
    this.error = '';
    this.success = '';
    this.modalService.open(this.medicamentFormModal, { ariaLabelledBy: 'modal-title' });
  }

  onSubmit(): void {
    if (this.medicamentForm.valid) {
      const medicamentData: Medicament = this.medicamentForm.value;
      if (this.isEditing && this.editingId) {
        this.updateMedicament(this.editingId, medicamentData);
      } else {
        this.createMedicament(medicamentData);
      }
    }
  }

  createMedicament(medicament: Medicament): void {
    this.loading = true;
    this.medicamentService.createMedicament(medicament).subscribe({
      next: (data) => {
        this.medicaments.push(data);
        this.filteredMedicaments = [...this.medicaments]; // Update filtered list
        this.success = 'Médicament créé avec succès';
        this.resetForm();
        this.loading = false;
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la création du médicament';
        this.loading = false;
      }
    });
  }

  updateMedicament(id: number, medicament: Medicament): void {
    this.loading = true;
    this.medicamentService.updateMedicament(id, medicament).subscribe({
      next: (data) => {
        const index = this.medicaments.findIndex(m => m.id === id);
        if (index !== -1) {
          this.medicaments[index] = data;
          this.filteredMedicaments = [...this.medicaments]; // Update filtered list
        }
        this.success = 'Médicament mis à jour avec succès';
        this.resetForm();
        this.loading = false;
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la mise à jour du médicament';
        this.loading = false;
      }
    });
  }

  deleteMedicament(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      this.loading = true;
      this.medicamentService.deleteMedicament(id).subscribe({
        next: () => {
          this.medicaments = this.medicaments.filter(m => m.id !== id);
          this.filteredMedicaments = [...this.medicaments]; // Update filtered list
          this.success = 'Médicament supprimé avec succès';
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Erreur lors de la suppression du médicament';
          this.loading = false;
        }
      });
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.filteredMedicaments.length) {
      this.currentPage++;
    }
  }

  resetForm(): void {
    this.medicamentForm.reset();
    this.isEditing = false;
    this.editingId = null;
  }

  cancelEdit(): void {
    this.resetForm();
    this.error = '';
    this.success = '';
    this.modalService.dismissAll();
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  trackByFn(index: number, item: Medicament): any {
    return item.id;
  }
}