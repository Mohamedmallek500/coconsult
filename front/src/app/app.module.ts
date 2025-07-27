import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TemoignagesComponent } from './temoignages/temoignages.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';
import { AdminUserManagementComponent } from './admin-user-management/admin-user-management.component';
import { AppointmentBookingComponent } from './appointment-booking/appointment-booking.component';
import { AuthInterceptor } from './auth.interceptor';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DoctorPatientsListComponent } from './doctor-patients-list/doctor-patients-list.component';
import { OrdonnanceModalComponent } from './ordonnance-modal/ordonnance-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MedicamentManagementComponent } from './medicament-management/medicament-management.component';
import { AddOrdonnanceModalComponent } from './add-ordonnance-modal/add-ordonnance-modal.component';
import { MaladieManagementComponent } from './maladie-management/maladie-management.component';
import { PatientAppointmentsListComponent } from './patient-appointments-list/patient-appointments-list.component';
import { FicheMedicaleModalComponent } from './fiche-medicale-modal/fiche-medicale-modal.component';
import { ProfilComponent } from './profil/profil.component';
import { FloatingChatbotComponent } from './floating-chatbot/floating-chatbot.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    TimelineComponent,
    TemoignagesComponent,
    AppointmentComponent,
    ContactComponent,
    LoginComponent,
    AdminUserManagementComponent,
    AppointmentBookingComponent,
    DoctorAppointmentsComponent,
    DoctorPatientsListComponent,
    OrdonnanceModalComponent,
    MedicamentManagementComponent,
    AddOrdonnanceModalComponent,
    MaladieManagementComponent,
    PatientAppointmentsListComponent,
    FicheMedicaleModalComponent,
    ProfilComponent,
    FloatingChatbotComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    FullCalendarModule,
    NgbModule,
    MatDialogModule


  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
