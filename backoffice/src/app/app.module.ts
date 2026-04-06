import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { StatCardComponent } from './shared/components/stat-card/stat-card.component';

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

@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    AdminLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    StatCardComponent,
    OverviewComponent,
    UsersListComponent,
    UserDetailComponent,
    KycManagementComponent,
    ReviewsListComponent,
    ReclamationsComponent,
    BadgesComponent,
    TrustScoresComponent,
    GrowthProfilesComponent,
    ContractsListComponent,
    JobsListComponent,
    EventsListComponent,
    RecruitmentListComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}