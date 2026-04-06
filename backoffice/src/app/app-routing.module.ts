import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { OverviewComponent } from './features/dashboard/overview/overview.component';
import { UsersListComponent } from './features/users/users-list/users-list.component';
import { UserDetailComponent } from './features/users/user-detail/user-detail.component';
import { KycManagementComponent } from './features/users/kyc-management/kyc-management.component';
import { ReviewsListComponent } from './features/reviews/reviews-list/reviews-list.component';
import { ReclamationsComponent } from './features/reviews/reclamations/reclamations.component';
import { BadgesComponent } from './features/reviews/badges/badges.component';
import { TrustScoresComponent } from './features/reviews/trust-scores/trust-scores.component';
import { GrowthProfilesComponent } from './features/reviews/growth-profiles/growth-profiles.component';
import { ContractsListComponent } from './features/contracts/contracts-list/contracts-list.component';
import { JobsListComponent } from './features/jobs/jobs-list/jobs-list.component';
import { EventsListComponent } from './features/events/events-list/events-list.component';
import { RecruitmentListComponent } from './features/recruitment/recruitment-list/recruitment-list.component';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./features/auth/auth.module').then(m => m.AuthModule)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',               component: OverviewComponent },
      { path: 'users',                   component: UsersListComponent },
      { path: 'users/kyc',               component: KycManagementComponent },
      { path: 'users/:id',               component: UserDetailComponent },
      { path: 'reviews',                 component: ReviewsListComponent },
      { path: 'reviews/reclamations',    component: ReclamationsComponent },
      { path: 'reviews/badges',          component: BadgesComponent },
      { path: 'reviews/trust-scores',    component: TrustScoresComponent },
      { path: 'reviews/growth-profiles', component: GrowthProfilesComponent },
      { path: 'contracts',               component: ContractsListComponent },
      { path: 'jobs',                    component: JobsListComponent },
      { path: 'events',                  component: EventsListComponent },
      { path: 'recruitment',             component: RecruitmentListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}