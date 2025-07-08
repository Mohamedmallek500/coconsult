import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

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
import { AbcComponent } from './abc/abc.component';

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
    AbcComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
