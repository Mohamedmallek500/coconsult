import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/services/auth-service.service';
import { MaladieService } from 'src/services/MaladieService.service';
import { User } from 'src/models/User.model';
import { Maladie } from 'src/models/Maladie.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: User = {
    email: '',
    password: '',
    role: 'patient',
    dossierfile: []
  };

  selectedFile: File | null = null;
  showLoginForm: boolean = true;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  maladies: Maladie[] = [];

  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private maladieService: MaladieService
  ) {}

  ngOnInit(): void {
    this.loadMaladies();
  }

  loadMaladies(): void {
    this.maladieService.getAllMaladies().subscribe({
      next: (data) => {
        this.maladies = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des maladies', err);
        this.errorMessage = 'Erreur lors du chargement des maladies';
      }
    });
  }

  toggleMaladieSelection(maladieId: number): void {
    if (!this.user.dossierfile) {
      this.user.dossierfile = [];
    }
    const index = this.user.dossierfile.indexOf(maladieId);
    if (index > -1) {
      this.user.dossierfile.splice(index, 1); // Retirer si déjà sélectionné
    } else {
      this.user.dossierfile.push(maladieId); // Ajouter sinon
    }
  }

  toggleForm(event: Event): void {
    event.preventDefault();
    this.showLoginForm = !this.showLoginForm;
    this.errorMessage = null;
    this.resetForm();
  }

  resetForm(): void {
    this.user = {
      email: '',
      password: '',
      role: 'patient',
      dossierfile: []
    };
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Validation du type de fichier
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(this.selectedFile.type)) {
        this.errorMessage = 'Seuls les fichiers JPEG ou PNG sont autorisés';
        this.selectedFile = null;
        return;
      }
      // Validation de la taille (10MB = 10 * 1024 * 1024 octets)
      if (this.selectedFile.size > 10 * 1024 * 1024) {
        this.errorMessage = 'L\'image ne doit pas dépasser 10MB';
        this.selectedFile = null;
        return;
      }
    } else {
      this.selectedFile = null;
    }
    // Réinitialiser le message d'erreur si le fichier est valide
    if (this.selectedFile && this.errorMessage?.includes('image')) {
      this.errorMessage = null;
    }
  }

  login(): void {
    if (!this.user.email || !this.user.password) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.user.email, this.user.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        const role = response.roles?.[0] || 'patient';
        const redirectUrl = role === 'doctor' ? '/home' : '/home';
        this.router.navigate([redirectUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Échec de la connexion';
      }
    });
  }

  onRegister(): void {
    if (!this.user.email || !this.user.password || !this.user.username) {
      this.errorMessage = 'Veuillez remplir tous les champs requis (nom d\'utilisateur, email, mot de passe)';
      return;
    }

    if (this.user.role === 'patient' && (!this.user.numCnss || !this.user.numDossier)) {
      this.errorMessage = 'Numéro CNSS et numéro de dossier sont requis pour les patients';
      return;
    }

    if (this.user.role === 'doctor' && (!this.user.speciality || !this.user.bio)) {
      this.errorMessage = 'Spécialité et bio sont requis pour les médecins';
      return;
    }

    // Assure que dossierfile est un tableau de nombres
    if (!this.user.dossierfile) {
      this.user.dossierfile = [];
    } else {
      this.user.dossierfile = this.user.dossierfile
        .map(id => Number(id))
        .filter(id => !isNaN(id));
    }

    this.isLoading = true;
    this.errorMessage = null;

    const registerObservable = this.user.role === 'patient'
      ? this.authService.registerPatient(this.user, this.selectedFile)
      : this.authService.registerDoctor(this.user, this.selectedFile);

    registerObservable.subscribe({
      next: () => {
        this.isLoading = false;
        this.showLoginForm = true;
        this.resetForm();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Échec de l\'inscription';
      }
    });
  }
}