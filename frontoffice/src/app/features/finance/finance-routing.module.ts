import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WalletComponent } from './wallet/wallet.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { EscrowComponent } from './escrow/escrow.component';
import { PaymentsHistoryComponent } from './payments-history/payments-history.component';

const routes: Routes = [
  {
    path: 'wallet',
    component: WalletComponent
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  },
  {
    path: 'escrow',
    component: EscrowComponent
  },
  {
    path: 'payments-history',
    component: PaymentsHistoryComponent
  },
  {
    path: '',
    redirectTo: 'wallet',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }