import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { KycSubmitComponent } from './pages/kyc-submit/kyc-submit.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { CreateReviewComponent } from './pages/create-review/create-review.component';
import { MyReviewsComponent } from './pages/my-reviews/my-reviews.component';
import { ReportReviewComponent } from './pages/report-review/report-review.component';
import { MyProgressComponent } from './pages/my-progress/my-progress.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    KycSubmitComponent,
    NavbarComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    CreateReviewComponent,
    MyReviewsComponent,
    ReportReviewComponent,
    MyProgressComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }