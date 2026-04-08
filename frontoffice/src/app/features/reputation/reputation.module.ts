import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReputationRoutingModule } from './reputation-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { TrustScoreComponent } from './trust-score/trust-score.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { BadgesComponent } from './badges/badges.component';
import { BadgesXpComponent } from './badges-xp/badges-xp.component';
import { HistoryComponent } from './history/history.component';
import { ProgressionComponent } from './progression/progression.component';

@NgModule({
  declarations: [
    TrustScoreComponent,
    ReviewsComponent,
    BadgesComponent,
    BadgesXpComponent,
    HistoryComponent,
    ProgressionComponent
  ],
  imports: [
    CommonModule,
    ReputationRoutingModule,
    SharedModule
  ]
})
export class ReputationModule {}