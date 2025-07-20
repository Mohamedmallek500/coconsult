import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { AdminUserManagementComponent } from './admin-user-management/admin-user-management.component';
import { AuthGuard } from './auth.guard';
import { AppointmentBookingComponent } from './appointment-booking/appointment-booking.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { DoctorPatientsListComponent } from './doctor-patients-list/doctor-patients-list.component';
import { MedicamentManagementComponent } from './medicament-management/medicament-management.component';
import { MaladieManagementComponent } from './maladie-management/maladie-management.component';
import { PatientAppointmentsListComponent } from './patient-appointments-list/patient-appointments-list.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginComponent,
  },
  {
    path: 'home',
    pathMatch: 'full',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'about',
    pathMatch: 'full',
    component: AboutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'liste-users',
    pathMatch: 'full',
    component: AdminUserManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'appointment/book/:id',
    pathMatch: 'full',
    component: AppointmentBookingComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'doctor-appointments',
    pathMatch: 'full',
    component: DoctorAppointmentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'doctor-patients',
    pathMatch: 'full',
    component: DoctorPatientsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/medicaments',
    pathMatch: 'full',
    component: MedicamentManagementComponent,
    canActivate: [AuthGuard]
  },
    {
    path: 'admin/maladies',
    pathMatch: 'full',
    component: MaladieManagementComponent,
    canActivate: [AuthGuard]
  },
      {
    path: 'historique',
    pathMatch: 'full',
    component: PatientAppointmentsListComponent,
    canActivate: [AuthGuard]
  },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
