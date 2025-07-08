import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/models/User.model';
import { Maladie } from 'src/models/Maladie.model';
import { UserService } from 'src/services/UserService.service';
import { MaladieService } from 'src/services/MaladieService.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css']
})
export class AdminUserManagementComponent implements OnInit {
  users: User[] = [];
  maladies: Maladie[] = [];
  filteredMaladies: Maladie[] = [];
  filteredUsers: User[] = [];
  userForm!: FormGroup;
  isEditing = false;
  editingUserId: number | null = null;
  showForm = false;
  loading = false;
  error = '';
  success = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  filterRole = '';
  filterSearch = '';
  maladieSearch = '';
  selectedMaladies: number[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;

  constructor(
    private userService: UserService,
    private maladieService: MaladieService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadMaladies();
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      numtel: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      adresse: ['', Validators.required],
      cin: ['', Validators.required],
      role: ['patient', Validators.required],
      numCnss: [''],
      nomDocteurFamille: [''],
      mpsi: [''],
      numDossier: [''],
      dossierfile: [[]],
      speciality: [''],
      bio: ['']
    });

    this.userForm.get('role')?.valueChanges.subscribe(role => {
      this.updateValidators(role);
    });
  }

  updateValidators(role: string): void {
    const numCnssControl = this.userForm.get('numCnss');
    const numDossierControl = this.userForm.get('numDossier');
    const specialityControl = this.userForm.get('speciality');
    const bioControl = this.userForm.get('bio');
    const passwordControl = this.userForm.get('password');

    numCnssControl?.clearValidators();
    numDossierControl?.clearValidators();
    specialityControl?.clearValidators();
    bioControl?.clearValidators();
    passwordControl?.clearValidators();

    if (role === 'patient') {
      numCnssControl?.setValidators([Validators.required]);
      numDossierControl?.setValidators([Validators.required]);
    } else if (role === 'doctor') {
      specialityControl?.setValidators([Validators.required]);
      bioControl?.setValidators([Validators.required]);
    }

    if (!this.isEditing) {
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    }

    numCnssControl?.updateValueAndValidity();
    numDossierControl?.updateValueAndValidity();
    specialityControl?.updateValueAndValidity();
    bioControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        this.users = response.content.map((user: any) => ({
          ...user,
          role: user.roles && user.roles.length > 0 ? user.roles[0] : 'patient',
          image: user.image
        }));
        this.totalPages = response.totalPages;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des utilisateurs');
        this.loading = false;
      }
    });
  }

  loadMaladies(): void {
    this.maladieService.getAllMaladies().subscribe({
      next: (maladies) => {
        this.maladies = maladies;
        this.filteredMaladies = [...maladies];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des maladies:', error);
      }
    });
  }

  filterMaladies(): void {
    if (!this.maladieSearch) {
      this.filteredMaladies = [...this.maladies];
      return;
    }
    this.filteredMaladies = this.maladies.filter(maladie =>
      maladie.name.toLowerCase().includes(this.maladieSearch.toLowerCase())
    );
  }

  onMaladieChange(event: any, maladieId: number): void {
    if (event.target.checked) {
      this.selectedMaladies.push(maladieId);
    } else {
      this.selectedMaladies = this.selectedMaladies.filter(id => id !== maladieId);
    }
    this.userForm.get('dossierfile')?.setValue(this.selectedMaladies);
  }

  isMaladieSelected(maladieId: number): boolean {
    return this.selectedMaladies.includes(maladieId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(this.selectedFile.type)) {
        this.imageError = 'Seuls les fichiers JPEG ou PNG sont autorisés';
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      }
      if (this.selectedFile.size > 10 * 1024 * 1024) {
        this.imageError = 'L\'image ne doit pas dépasser 10MB';
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      }
      this.imageError = null;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/default-profile.png';
    const parts = imagePath.split('assets\\images\\');
    if (parts.length > 1) {
      return `assets/images/${parts[1]}`;
    }
    return imagePath;
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = !this.filterRole || user.role === this.filterRole;
      const matchesSearch = !this.filterSearch ||
        user.nom?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        user.username?.toLowerCase().includes(this.filterSearch.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.editingUserId = null;
    this.selectedMaladies = [];
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageError = null;
    this.userForm.reset();
    this.userForm.patchValue({ role: 'patient' });
    this.updateValidators('patient');
  }

editUser(user: User): void {
  this.showForm = true;
  this.isEditing = true;
  this.editingUserId = user.id || null;
  this.selectedMaladies = user.dossierfile?.map(m => typeof m === 'number' ? m : m.id) || [];

  // Initialiser l'image preview si l'utilisateur a une image
  this.imagePreview = user.image ? this.getImageUrl(user.image) : null;

  this.userForm.patchValue({
    username: user.username,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    numtel: user.numtel,
    dateNaissance: user.dateNaissance,
    adresse: user.adresse,
    cin: user.cin,
    role: user.role || 'patient',
    numCnss: user.numCnss,
    nomDocteurFamille: user.nomDocteurFamille,
    mpsi: user.mpsi,
    numDossier: user.numDossier,
    dossierfile: this.selectedMaladies,
    speciality: user.speciality,
    bio: user.bio
  });

  this.updateValidators(user.role || 'patient');
}

cancelEdit(): void {
  this.showForm = false;
  this.isEditing = false;
  this.editingUserId = null;
  this.selectedMaladies = [];
  this.selectedFile = null;
  this.imagePreview = null;
  this.imageError = null;
  this.userForm.reset();
  this.userForm.patchValue({ role: 'patient' });
}
saveUser(): void {
  if (this.userForm.valid) {
    this.loading = true;
    const formData = this.userForm.value;

    const userData: User = {
      id: this.isEditing ? this.editingUserId || undefined : undefined,
      username: formData.username,
      email: formData.email,
      password: formData.password?.trim() || undefined,
      nom: formData.nom || null,
      prenom: formData.prenom || null,
      numtel: formData.numtel || null,
      dateNaissance: formData.dateNaissance || null,
      adresse: formData.adresse || null,
      cin: formData.cin || null,
      role: formData.role,
      numCnss: formData.role === 'patient' ? formData.numCnss || null : null,
      nomDocteurFamille: formData.role === 'patient' ? formData.nomDocteurFamille || null : null,
      mpsi: formData.role === 'patient' ? formData.mpsi || null : null,
      numDossier: formData.role === 'patient' ? formData.numDossier || null : null,
      dossierfile: formData.role === 'patient' ? formData.dossierfile || [] : [],
      speciality: formData.role === 'doctor' ? formData.speciality || null : null,
      bio: formData.role === 'doctor' ? formData.bio || null : null,
      isApproved: formData.role === 'doctor' ? false : undefined
    };

    if (this.isEditing && this.editingUserId) {
      // Appel unique pour la mise à jour avec ou sans image
      this.userService.updateUser(this.editingUserId, userData, this.selectedFile || undefined).subscribe({
        next: (response: { message: string }) => {
          this.showSuccess('Utilisateur mis à jour avec succès');
          this.cancelEdit();
          this.loadUsers();
          this.loading = false;
        },
        error: (error) => {
          this.showError(error.message || 'Erreur lors de la mise à jour');
          this.loading = false;
        }
      });
    } else {
      this.userService.createUser(userData, this.selectedFile || undefined).subscribe({
        next: (response: { message: string }) => {
          this.showSuccess('Utilisateur créé avec succès');
          this.cancelEdit();
          this.loadUsers();
          this.loading = false;
        },
        error: (error) => {
          this.showError(error.message || 'Erreur lors de la création');
          this.loading = false;
        }
      });
    }
  } else {
    this.showError('Veuillez remplir tous les champs requis correctement');
    this.userForm.markAllAsTouched();
  }
}

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ${user.prenom} ?`)) {
      this.loading = true;
      this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          this.showSuccess('Utilisateur supprimé avec succès');
          this.loadUsers();
          this.loading = false;
        },
        error: (error) => {
          this.showError(error.message || 'Erreur lors de la suppression');
          this.loading = false;
        }
      });
    }
  }

  approveDoctor(user: User): void {
    this.loading = true;
    this.userService.approveDoctor(user.id!).subscribe({
      next: () => {
        this.showSuccess(`Docteur ${user.nom} ${user.prenom} approuvé avec succès`);
        this.loadUsers();
        this.loading = false;
      },
      error: (error) => {
        this.showError(error.message || 'Erreur lors de l\'approbation');
        this.loading = false;
      }
    });
  }

  refuseDoctor(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir refuser le docteur ${user.nom} ${user.prenom} ?`)) {
      this.loading = true;
      this.userService.refuseDoctor(user.id!).subscribe({
        next: () => {
          this.showSuccess(`Docteur ${user.nom} ${user.prenom} refusé`);
          this.loadUsers();
          this.loading = false;
        },
        error: (error) => {
          this.showError(error.message || 'Erreur lors du refus');
          this.loading = false;
        }
      });
    }
  }

  getMaladieNames(ids: any[]): string {
    if (!ids || ids.length === 0) return 'Aucune';
    return ids.map(id => {
      const maladieId = typeof id === 'number' ? id : id.id;
      const maladie = this.maladies.find(m => m.id === maladieId);
      return maladie ? maladie.name : `Maladie ${maladieId}`;
    }).join(', ');
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  private showError(message: string): void {
    this.error = message;
    this.success = '';
    setTimeout(() => this.error = '', 5000);
  }

  private showSuccess(message: string): void {
    this.success = message;
    this.error = '';
    setTimeout(() => this.success = '', 5000);
  }
}