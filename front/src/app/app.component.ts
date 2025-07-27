import { Component } from '@angular/core';
import { AuthServiceService } from 'src/services/auth-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
      isAuthenticated: boolean = false;

  title = 'front';
        constructor(private authService: AuthServiceService) {
          // Écoute l’état d’authentification
          this.authService.isAuthenticated$.subscribe(status => {
            this.isAuthenticated = status;
          });
          }
      
}
