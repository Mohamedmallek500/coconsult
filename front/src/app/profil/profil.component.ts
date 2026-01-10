import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/models/User.model';
import { Maladie } from 'src/models/Maladie.model';
import { UserService } from 'src/services/UserService.service';
import { MaladieService } from 'src/services/MaladieService.service';
import { AuthServiceService } from 'src/services/auth-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  userRole: string | null = null;
  maladies: Maladie[] = [];
  filteredMaladies: Maladie[] = [];
  selectedMaladies: number[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;
  loading = false;
  error = '';
  success = '';
  maladieSearch = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private maladieService: MaladieService,
    private authService: AuthServiceService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.userRole$.subscribe(role => {
        this.userRole = role;
        this.updateValidators(role || 'patient');
      })
    );
    this.subscriptions.push(
      this.authService.userId$.subscribe(userId => {
        if (userId) {
          this.loadUserProfile(userId);
        }
      })
    );
    this.loadMaladies();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      numtel: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      adresse: ['', Validators.required],
      cin: ['', Validators.required],
      numCnss: [''],
      nomDocteurFamille: [''],
      mpsi: [''],
      numDossier: [''],
      dossierfile: [[]],
      speciality: [''],
      bio: ['']
    });
  }

  updateValidators(role: string): void {
    const numCnssControl = this.profileForm.get('numCnss');
    const numDossierControl = this.profileForm.get('numDossier');
    const specialityControl = this.profileForm.get('speciality');
    const bioControl = this.profileForm.get('bio');
    const passwordControl = this.profileForm.get('password');

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

    passwordControl?.setValidators([Validators.minLength(6)]);

    numCnssControl?.updateValueAndValidity();
    numDossierControl?.updateValueAndValidity();
    specialityControl?.updateValueAndValidity();
    bioControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
  }

  loadUserProfile(userId: number): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        this.user = user;
        this.selectedMaladies = user.dossierfile?.map(m => typeof m === 'number' ? m : m.id) || [];
        this.imagePreview = user.image ? this.getImageUrl(user.image) : null;
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          numtel: user.numtel,
          dateNaissance: user.dateNaissance,
          adresse: user.adresse,
          cin: user.cin,
          numCnss: user.numCnss,
          nomDocteurFamille: user.nomDocteurFamille,
          mpsi: user.mpsi,
          numDossier: user.numDossier,
          dossierfile: this.selectedMaladies,
          speciality: user.speciality,
          bio: user.bio
        });
        this.loading = false;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement du profil');
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
        this.showError('Erreur lors du chargement des maladies');
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
    this.profileForm.get('dossierfile')?.setValue(this.selectedMaladies);
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

  saveProfile(): void {
    if (this.profileForm.valid && this.user?.id) {
      this.loading = true;
      const formData = this.profileForm.value;

      const userData: User = {
        id: this.user.id,
        username: formData.username,
        email: formData.email,
        password: formData.password?.trim() || undefined,
        nom: formData.nom || null,
        prenom: formData.prenom || null,
        numtel: formData.numtel || null,
        dateNaissance: formData.dateNaissance || null,
        adresse: formData.adresse || null,
        cin: formData.cin || null,
        role: this.userRole || 'patient',
        numCnss: this.userRole === 'patient' ? formData.numCnss || null : null,
        nomDocteurFamille: this.userRole === 'patient' ? formData.nomDocteurFamille || null : null,
        mpsi: this.userRole === 'patient' ? formData.mpsi || null : null,
        numDossier: this.userRole === 'patient' ? formData.numDossier || null : null,
        dossierfile: this.userRole === 'patient' ? formData.dossierfile || [] : [],
        speciality: this.userRole === 'doctor' ? formData.speciality || null : null,
        bio: this.userRole === 'doctor' ? formData.bio || null : null,
        isApproved: this.user?.isApproved
      };

      this.userService.updateUser(this.user.id, userData, this.selectedFile || undefined).subscribe({
        next: (response: { message: string }) => {
          this.showSuccess('Profil mis à jour avec succès');
          this.loadUserProfile(this.user!.id!);
          this.selectedFile = null;
          this.imagePreview = userData.image ? this.getImageUrl(userData.image) : null;
          this.loading = false;
        },
        error: (error) => {
          this.showError(error.message || 'Erreur lors de la mise à jour du profil');
          this.loading = false;
        }
      });
    } else {
      this.showError('Veuillez remplir tous les champs requis correctement');
      this.profileForm.markAllAsTouched();
    }
  }

  cancel(): void {
    if (this.user?.id) {
      this.loadUserProfile(this.user.id);
    }
    this.selectedFile = null;
    this.imagePreview = this.user?.image ? this.getImageUrl(this.user.image) : null;
    this.imageError = null;
    this.profileForm.markAsPristine();
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