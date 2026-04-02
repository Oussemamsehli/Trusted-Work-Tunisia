import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { KycSubmitComponent } from './pages/kyc-submit/kyc-submit.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { CreateReviewComponent } from './review/pages/create-review/create-review.component';
import { MyReviewsComponent } from './review/pages/my-reviews/my-reviews.component';
import { ReportReviewComponent } from './review/pages/report-review/report-review.component';
import { MyProgressComponent } from './review/pages/my-progress/my-progress.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'kyc', component: KycSubmitComponent, canActivate: [AuthGuard] },

  { path: 'reviews/create', component: CreateReviewComponent, canActivate: [AuthGuard] },
  { path: 'reviews/my-reviews', component: MyReviewsComponent, canActivate: [AuthGuard] },
  { path: 'reviews/report', component: ReportReviewComponent, canActivate: [AuthGuard] },
  { path: 'reviews/my-progress', component: MyProgressComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '' }
];

  

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
