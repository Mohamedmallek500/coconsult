import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  loginForm: FormGroup;
  registerForm: FormGroup;
  selectedFile: File | null = null;
  showLoginForm: boolean = true;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  maladies: Maladie[] = [];

  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private maladieService: MaladieService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      numtel: ['', [Validators.maxLength(15)]],
      nom: ['', [Validators.maxLength(50)]],
      prenom: ['', [Validators.maxLength(50)]],
      dateNaissance: [''],
      adresse: ['', [Validators.maxLength(255)]],
      cin: ['', [Validators.maxLength(20)]],
      role: ['patient', [Validators.required]],
      numCnss: ['', [Validators.maxLength(20)]],
      nomDocteurFamille: ['', [Validators.maxLength(100)]],
      mpsi: ['', [Validators.maxLength(20)]],
      numDossier: ['', [Validators.maxLength(20)]],
      dossierfile: [[]],
      speciality: ['', [Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadMaladies();
    this.updateFormValidators();
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

  updateFormValidators(): void {
    const roleControl = this.registerForm.get('role');
    const numCnssControl = this.registerForm.get('numCnss');
    const numDossierControl = this.registerForm.get('numDossier');
    const specialityControl = this.registerForm.get('speciality');
    const bioControl = this.registerForm.get('bio');

    roleControl?.valueChanges.subscribe(role => {
      if (role === 'patient') {
        numCnssControl?.setValidators([Validators.required, Validators.maxLength(20)]);
        numDossierControl?.setValidators([Validators.required, Validators.maxLength(20)]);
        specialityControl?.clearValidators();
        bioControl?.clearValidators();
      } else {
        numCnssControl?.clearValidators();
        numDossierControl?.clearValidators();
        specialityControl?.setValidators([Validators.required, Validators.maxLength(100)]);
        bioControl?.setValidators([Validators.required, Validators.maxLength(500)]);
      }
      numCnssControl?.updateValueAndValidity();
      numDossierControl?.updateValueAndValidity();
      specialityControl?.updateValueAndValidity();
      bioControl?.updateValueAndValidity();
    });
  }

  setRole(role: string): void {
    this.registerForm.get('role')?.setValue(role);
  }

  toggleMaladieSelection(maladieId: number): void {
    const dossierfile = this.registerForm.get('dossierfile')?.value || [];
    const index = dossierfile.indexOf(maladieId);
    if (index > -1) {
      dossierfile.splice(index, 1);
    } else {
      dossierfile.push(maladieId);
    }
    this.registerForm.get('dossierfile')?.setValue([...dossierfile]);
  }

  toggleForm(event: Event): void {
    event.preventDefault();
    this.showLoginForm = !this.showLoginForm;
    this.errorMessage = null;
    this.resetForm();
  }

  resetForm(): void {
    this.loginForm.reset({ email: '', password: '' });
    this.registerForm.reset({ role: 'patient', dossierfile: [] });
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(this.selectedFile.type)) {
        this.errorMessage = 'Seuls les fichiers JPEG ou PNG sont autorisés';
        this.selectedFile = null;
        return;
      }
      if (this.selectedFile.size > 10 * 1024 * 1024) {
        this.errorMessage = 'L\'image ne doit pas dépasser 10MB';
        this.selectedFile = null;
        return;
      }
    } else {
      this.selectedFile = null;
    }
    if (this.selectedFile && this.errorMessage?.includes('image')) {
      this.errorMessage = null;
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        const role = response.roles?.[0] || 'patient';
        const redirectUrl = role === 'doctor' ? '/home' : '/home';
        this.router.navigate([redirectUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Échec de la connexion';
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis correctement';
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const user: User = this.registerForm.value;
    user.dossierfile = user.dossierfile?.map(id => Number(id)).filter(id => !isNaN(id)) || [];

    const registerObservable = user.role === 'patient'
      ? this.authService.registerPatient(user, this.selectedFile)
      : this.authService.registerDoctor(user, this.selectedFile);

    registerObservable.subscribe({
      next: () => {
        this.isLoading = false;
        this.showLoginForm = true;
        this.resetForm();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Échec de l\'inscription';
      }
    });
  }
}