import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UsersListComponent } from './users-list/users-list.component';
import { KycListComponent } from './kyc-list/kyc-list.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { ReclamationsListComponent } from './reclamations-list/reclamations-list.component';
import { BadgesListComponent } from './badges-list/badges-list.component';
import { TrustScoresComponent } from './trust-scores/trust-scores.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UsersListComponent,
    KycListComponent,
    ReviewsListComponent,
    ReclamationsListComponent,
    BadgesListComponent,
    TrustScoresComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }