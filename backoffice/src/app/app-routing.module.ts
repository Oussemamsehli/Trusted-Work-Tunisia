import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UsersListComponent } from './users-list/users-list.component';
import { KycListComponent } from './kyc-list/kyc-list.component';
import { AuthGuard } from './guards/auth.guard';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { ReclamationsListComponent } from './reclamations-list/reclamations-list.component';
import { BadgesListComponent } from './badges-list/badges-list.component';
import { TrustScoresComponent } from './trust-scores/trust-scores.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersListComponent, canActivate: [AuthGuard] },
  { path: 'kyc', component: KycListComponent, canActivate: [AuthGuard] },
  { path: 'reviews', component: ReviewsListComponent, canActivate: [AuthGuard] },
  { path: 'reclamations', component: ReclamationsListComponent, canActivate: [AuthGuard] },
  { path: 'badges', component: BadgesListComponent, canActivate: [AuthGuard] },
  { path: 'trustscores', component: TrustScoresComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }