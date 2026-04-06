import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApplicationsComponent } from './applications/applications.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { ParticipationsComponent } from './participations/participations.component';
import { MyReviewsComponent } from './my-reviews/my-reviews.component';

const routes: Routes = [
  { path: 'applications', component: ApplicationsComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: 'deliveries', component: DeliveriesComponent },
  { path: 'participations', component: ParticipationsComponent },
  { path: 'my-reviews', component: MyReviewsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityRoutingModule { }