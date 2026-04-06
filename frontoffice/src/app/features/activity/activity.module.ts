import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityRoutingModule } from './activity-routing.module';
import { ApplicationsComponent } from './applications/applications.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { ParticipationsComponent } from './participations/participations.component';
import { MyReviewsComponent } from './my-reviews/my-reviews.component';


@NgModule({
  declarations: [
    ApplicationsComponent,
    ContractsComponent,
    DeliveriesComponent,
    ParticipationsComponent,
    MyReviewsComponent
  ],
  imports: [
    CommonModule,
    ActivityRoutingModule
  ]
})
export class ActivityModule { }
