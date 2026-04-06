import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { WalletComponent } from './wallet/wallet.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { EscrowComponent } from './escrow/escrow.component';
import { PaymentsHistoryComponent } from './payments-history/payments-history.component';


@NgModule({
  declarations: [
    WalletComponent,
    TransactionsComponent,
    EscrowComponent,
    PaymentsHistoryComponent
  ],
  imports: [
    CommonModule,
    FinanceRoutingModule
  ]
})
export class FinanceModule { }
