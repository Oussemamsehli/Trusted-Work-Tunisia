import { Pipe, PipeTransform } from '@angular/core';
import { TrustScoreResponse, CategorieConfiance } from '../../core/models/review.model';

@Pipe({ name: 'filterCat' })
export class FilterCatPipe implements PipeTransform {
  transform(items: TrustScoreResponse[], cat: CategorieConfiance): number {
    if (!items) return 0;
    return items.filter(i => i.categorie === cat).length;
  }
}