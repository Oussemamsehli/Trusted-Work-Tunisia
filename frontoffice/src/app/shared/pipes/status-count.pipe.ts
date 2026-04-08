import { Pipe, PipeTransform } from '@angular/core';
import { ReclamationResponse, StatusReclamation } from '../../core/models/review.model';

@Pipe({ name: 'statusCount' })
export class StatusCountPipe implements PipeTransform {
  transform(items: ReclamationResponse[], status: StatusReclamation): number {
    if (!items) return 0;
    return items.filter(i => i.status === status).length;
  }
}