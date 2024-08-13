import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AddressModule } from './address/address.module';
import { AttachmentModule } from './attachment/attachment.module';
import { BalanceSheetModule } from './balancesheet/balancesheet.module';
import { CashflowStatementModule } from './cashflowstatement/cashflowstatement.module';
import { CompanyInfoModule } from './companyinfo/companyinfo.module';
import { ContactModule } from './contact/contact.module';
import { CreditNoteModule } from './creditnote/creditnote.module';
import { ExpenseModule } from './expense/expense.module';
import { IncomeStatementModule } from './incomestatement/incomestatement.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ItemModule } from './item/item.module';
import { JournalEntryModule } from './journalentry/journalentry.module';
import { PaymentModule } from './payment/payment.module';
import { PhoneNumberModule } from './phonenumber/phonenumber.module';
import { PurchaseOrderModule } from './purchaseorder/purchaseorder.module';
import { TaxRateModule } from './taxrate/taxrate.module';
import { TrackingCategoryModule } from './trackingcategory/trackingcategory.module';
import { TransactionModule } from './transaction/transaction.module';
import { VendorCreditModule } from './vendorcredit/vendorcredit.module';
import { AccountingUnificationService } from './@lib/@unification';

@Module({
  exports: [
    AccountModule,
    AddressModule,
    AttachmentModule,
    BalanceSheetModule,
    CashflowStatementModule,
    CompanyInfoModule,
    ContactModule,
    CreditNoteModule,
    ExpenseModule,
    IncomeStatementModule,
    InvoiceModule,
    ItemModule,
    JournalEntryModule,
    PaymentModule,
    PhoneNumberModule,
    PurchaseOrderModule,
    TaxRateModule,
    TrackingCategoryModule,
    TransactionModule,
    VendorCreditModule,
  ],
  providers: [AccountingUnificationService],
  imports: [
    AccountModule,
    AddressModule,
    AttachmentModule,
    BalanceSheetModule,
    CashflowStatementModule,
    CompanyInfoModule,
    ContactModule,
    CreditNoteModule,
    ExpenseModule,
    IncomeStatementModule,
    InvoiceModule,
    ItemModule,
    JournalEntryModule,
    PaymentModule,
    PhoneNumberModule,
    PurchaseOrderModule,
    TaxRateModule,
    TrackingCategoryModule,
    TransactionModule,
    VendorCreditModule,
  ],
})
export class AccountingModule {}
