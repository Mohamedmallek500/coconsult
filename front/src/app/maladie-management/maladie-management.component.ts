import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Maladie } from 'src/models/Maladie.model';
import { MaladieService } from 'src/services/MaladieService.service';

@Component({
  selector: 'app-maladie-management',
  templateUrl: './maladie-management.component.html',
  styleUrls: ['./maladie-management.component.css']
})
export class MaladieManagementComponent implements OnInit {
  @ViewChild('maladieFormModal') maladieFormModal!: TemplateRef<any>;

  maladies: Maladie[] = [];
  filteredMaladies: Maladie[] = [];
  maladieForm: FormGroup;
  filterName: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(
    private maladieService: MaladieService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.maladieForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadMaladies();
  }

  loadMaladies(): void {
    this.loading = true;
    this.maladieService.getAllMaladies().subscribe({
      next: (data) => {
        this.maladies = data;
        this.filteredMaladies = [...data]; // Initialize filtered list
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des maladies';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filteredMaladies = this.maladies.filter(maladie =>
      maladie.name.toLowerCase().includes(this.filterName.toLowerCase())
    );
    this.currentPage = 0; // Reset to first page on filter change
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.maladieForm.reset();
    this.error = '';
    this.success = '';
    this.modalService.open(this.maladieFormModal, { ariaLabelledBy: 'modal-title' });
  }

  editMaladie(maladie: Maladie): void {
    this.isEditing = true;
    this.editingId = maladie.id!;
    this.maladieForm.patchValue({
      name: maladie.name,
      description: maladie.description || ''
    });
    this.error = '';
    this.success = '';
    this.modalService.open(this.maladieFormModal, { ariaLabelledBy: 'modal-title' });
  }

  onSubmit(): void {
    if (this.maladieForm.valid) {
      const maladieData: Maladie = this.maladieForm.value;
      if (this.isEditing && this.editingId) {
        this.updateMaladie(this.editingId, maladieData);
      } else {
        this.createMaladie(maladieData);
      }
    }
  }

  createMaladie(maladie: Maladie): void {
    this.loading = true;
    this.maladieService.createMaladie(maladie).subscribe({
      next: (data) => {
        this.maladies.push(data);
        this.filteredMaladies = [...this.maladies]; // Update filtered list
        this.success = 'Maladie créée avec succès';
        this.resetForm();
        this.loading = false;
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la création de la maladie';
        this.loading = false;
      }
    });
  }

  updateMaladie(id: number, maladie: Maladie): void {
    this.loading = true;
    this.maladieService.updateMaladie(id, maladie).subscribe({
      next: (data) => {
        const index = this.maladies.findIndex(m => m.id === id);
        if (index !== -1) {
          this.maladies[index] = data;
          this.filteredMaladies = [...this.maladies]; // Update filtered list
        }
        this.success = 'Maladie mise à jour avec succès';
        this.resetForm();
        this.loading = false;
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la mise à jour de la maladie';
        this.loading = false;
      }
    });
  }

  deleteMaladie(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette maladie ?')) {
      this.loading = true;
      this.maladieService.deleteMaladie(id).subscribe({
        next: () => {
          this.maladies = this.maladies.filter(m => m.id !== id);
          this.filteredMaladies = [...this.maladies]; // Update filtered list
          this.success = 'Maladie supprimée avec succès';
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Erreur lors de la suppression de la maladie';
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
    if ((this.currentPage + 1) * this.pageSize < this.filteredMaladies.length) {
      this.currentPage++;
    }
  }

  resetForm(): void {
    this.maladieForm.reset();
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

  trackByFn(index: number, item: Maladie): any {
    return item.id;
  }
}