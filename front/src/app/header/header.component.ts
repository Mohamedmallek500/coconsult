import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/services/auth-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isAuthenticated: boolean = false;
  userName: string | null = null;
  userRole: string | null = null;

  constructor(private authService: AuthServiceService, private router: Router) {
    // Écoute l’état d’authentification
    this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    });

    // Écoute le nom d’utilisateur
    this.authService.userName$.subscribe(name => {
      this.userName = name;
    });

    // Écoute le rôle
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
}
