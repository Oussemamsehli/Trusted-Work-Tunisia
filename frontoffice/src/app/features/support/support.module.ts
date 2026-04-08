import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportRoutingModule } from './support-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ReclamationsComponent } from './reclamations/reclamations.component';

@NgModule({
  declarations: [
    ReclamationsComponent
  ],
  imports: [
    CommonModule,
    SupportRoutingModule,
    SharedModule
  ]
})
export class SupportModule {}