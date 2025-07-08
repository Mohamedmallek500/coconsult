import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from 'src/models/User.model';
import { UserService } from 'src/services/UserService.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  doctors: User[] = [];
  searchForm: FormGroup;
  isLoading = false;
  errorMessage = '';
    specialities: string[] = []; // Ajout de la liste des spécialités

gouvernorats: string[] = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
  'Jendouba', 'Kairouan', 'Kasserine', 'Kebili', 'Kef', 'La Manouba',
  'Mahdia', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
  'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
].sort();



  constructor(private userService: UserService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
        nom: [''],
  prenom: [''],
      speciality: [''],
      adresse: ['']
    });
  }

  ngOnInit(): void {
    // Load initial doctor list
    this.searchDoctors();
    this.loadSpecialities();

    // Subscribe to form changes with debounce
    this.searchForm.valueChanges.pipe(debounceTime(300)).subscribe(filters => {
      console.log('Form values changed:', filters);
      this.searchDoctors();
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
  

    loadSpecialities(): void {
    this.userService.getAllSpecialities().subscribe({
      next: (specialities) => {
        this.specialities = specialities.sort();
      },
      error: (err) => {
        console.error('Failed to load specialities:', err);
      }
    });
  }

  searchDoctors(): void {
    this.isLoading = true;
    this.errorMessage = '';
const { nom, prenom, speciality, adresse } = this.searchForm.value;
    console.log('Searching with:', { nom,prenom, speciality, adresse });

this.userService.searchDoctors(nom, prenom, speciality, adresse).subscribe({
      next: (doctors: User[]) => {
        console.log('Doctors received:', doctors);
        this.doctors = doctors;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching doctors:', err);
        this.errorMessage = 'Failed to load doctors. Please check your connection or try again.';
        this.isLoading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.errorMessage = '';
    this.searchDoctors();
  }
}