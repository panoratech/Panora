import { IAccountService } from '@accounting/account/types';
import {
  UnifiedAccountingAccountInput,
  UnifiedAccountingAccountOutput,
} from '@accounting/account/types/model.unified';
import { IAddressService } from '@accounting/address/types';
import {
  UnifiedAccountingAddressInput,
  UnifiedAccountingAddressOutput,
} from '@accounting/address/types/model.unified';
import { IAttachmentService } from '@accounting/attachment/types';
import {
  UnifiedAccountingAttachmentInput,
  UnifiedAccountingAttachmentOutput,
} from '@accounting/attachment/types/model.unified';
import { IBalanceSheetService } from '@accounting/balancesheet/types';
import {
  UnifiedAccountingBalancesheetInput,
  UnifiedAccountingBalancesheetOutput,
} from '@accounting/balancesheet/types/model.unified';
import { ICashflowStatementService } from '@accounting/cashflowstatement/types';
import {
  UnifiedAccountingCashflowstatementInput,
  UnifiedAccountingCashflowstatementOutput,
} from '@accounting/cashflowstatement/types/model.unified';
import { ICompanyInfoService } from '@accounting/companyinfo/types';
import {
  UnifiedAccountingCompanyinfoInput,
  UnifiedAccountingCompanyinfoOutput,
} from '@accounting/companyinfo/types/model.unified';
import { IContactService } from '@accounting/contact/types';
import {
  UnifiedAccountingContactInput,
  UnifiedAccountingContactOutput,
} from '@accounting/contact/types/model.unified';
import { ICreditNoteService } from '@accounting/creditnote/types';
import {
  UnifiedAccountingCreditnoteInput,
  UnifiedAccountingCreditnoteOutput,
} from '@accounting/creditnote/types/model.unified';
import { IExpenseService } from '@accounting/expense/types';
import {
  UnifiedAccountingExpenseInput,
  UnifiedAccountingExpenseOutput,
} from '@accounting/expense/types/model.unified';
import { IIncomeStatementService } from '@accounting/incomestatement/types';
import {
  UnifiedAccountingIncomestatementInput,
  UnifiedAccountingIncomestatementOutput,
} from '@accounting/incomestatement/types/model.unified';
import { IInvoiceService } from '@accounting/invoice/types';
import {
  UnifiedAccountingInvoiceInput,
  UnifiedAccountingInvoiceOutput,
} from '@accounting/invoice/types/model.unified';
import { IItemService } from '@accounting/item/types';
import {
  UnifiedAccountingItemInput,
  UnifiedAccountingItemOutput,
} from '@accounting/item/types/model.unified';
import { IJournalEntryService } from '@accounting/journalentry/types';
import {
  UnifiedAccountingJournalentryInput,
  UnifiedAccountingJournalentryOutput,
} from '@accounting/journalentry/types/model.unified';
import { IPaymentService } from '@accounting/payment/types';
import {
  UnifiedAccountingPaymentInput,
  UnifiedAccountingPaymentOutput,
} from '@accounting/payment/types/model.unified';
import { IPhoneNumberService } from '@accounting/phonenumber/types';
import {
  UnifiedAccountingPhonenumberInput,
  UnifiedAccountingPhonenumberOutput,
} from '@accounting/phonenumber/types/model.unified';
import { IPurchaseOrderService } from '@accounting/purchaseorder/types';
import {
  UnifiedAccountingPurchaseorderInput,
  UnifiedAccountingPurchaseorderOutput,
} from '@accounting/purchaseorder/types/model.unified';
import { ITaxRateService } from '@accounting/taxrate/types';
import {
  UnifiedAccountingTaxrateInput,
  UnifiedAccountingTaxrateOutput,
} from '@accounting/taxrate/types/model.unified';
import { ITrackingCategoryService } from '@accounting/trackingcategory/types';
import {
  UnifiedAccountingTrackingcategoryInput,
  UnifiedAccountingTrackingcategoryOutput,
} from '@accounting/trackingcategory/types/model.unified';
import { ITransactionService } from '@accounting/transaction/types';
import {
  UnifiedAccountingTransactionInput,
  UnifiedAccountingTransactionOutput,
} from '@accounting/transaction/types/model.unified';
import { IVendorCreditService } from '@accounting/vendorcredit/types';
import {
  UnifiedAccountingVendorcreditInput,
  UnifiedAccountingVendorcreditOutput,
} from '@accounting/vendorcredit/types/model.unified';

export enum AccountingObject {
  balancesheet = 'balancesheet',
  cashflowstatement = 'cashflowstatement',
  companyinfo = 'companyinfo',
  contact = 'contact',
  creditnote = 'creditnote',
  expense = 'expense',
  incomestatement = 'incomestatement',
  invoice = 'invoice',
  item = 'item',
  journalentry = 'journalentry',
  payment = 'payment',
  phonenumber = 'phonenumber',
  purchaseorder = 'purchaseorder',
  taxrate = 'taxrate',
  trackingcategory = 'trackingcategory',
  transaction = 'transaction',
  vendorcredit = 'vendorcredit',
  account = 'account',
  address = 'address',
  attachment = 'attachment',
}

export type UnifiedAccounting =
  | UnifiedAccountingBalancesheetInput
  | UnifiedAccountingBalancesheetOutput
  | UnifiedAccountingCashflowstatementInput
  | UnifiedAccountingCashflowstatementOutput
  | UnifiedAccountingCompanyinfoInput
  | UnifiedAccountingCompanyinfoOutput
  | UnifiedAccountingContactInput
  | UnifiedAccountingContactOutput
  | UnifiedAccountingCreditnoteInput
  | UnifiedAccountingCreditnoteOutput
  | UnifiedAccountingExpenseInput
  | UnifiedAccountingExpenseOutput
  | UnifiedAccountingIncomestatementInput
  | UnifiedAccountingIncomestatementOutput
  | UnifiedAccountingInvoiceInput
  | UnifiedAccountingInvoiceOutput
  | UnifiedAccountingItemInput
  | UnifiedAccountingItemOutput
  | UnifiedAccountingJournalentryInput
  | UnifiedAccountingJournalentryOutput
  | UnifiedAccountingPaymentInput
  | UnifiedAccountingPaymentOutput
  | UnifiedAccountingPhonenumberInput
  | UnifiedAccountingPhonenumberOutput
  | UnifiedAccountingPurchaseorderInput
  | UnifiedAccountingPurchaseorderOutput
  | UnifiedAccountingTaxrateInput
  | UnifiedAccountingTaxrateOutput
  | UnifiedAccountingTrackingcategoryInput
  | UnifiedAccountingTrackingcategoryOutput
  | UnifiedAccountingTransactionInput
  | UnifiedAccountingTransactionOutput
  | UnifiedAccountingVendorcreditInput
  | UnifiedAccountingVendorcreditOutput
  | UnifiedAccountingAddressInput
  | UnifiedAccountingAddressOutput
  | UnifiedAccountingAttachmentInput
  | UnifiedAccountingAttachmentOutput
  | UnifiedAccountingAccountInput
  | UnifiedAccountingAccountOutput;

export type IAccountingService =
  | IAddressService
  | IAttachmentService
  | IAccountService
  | IBalanceSheetService
  | ICashflowStatementService
  | ICompanyInfoService
  | IContactService
  | ICreditNoteService
  | IExpenseService
  | IIncomeStatementService
  | IInvoiceService
  | IItemService
  | IJournalEntryService
  | IPaymentService
  | IPhoneNumberService
  | IPurchaseOrderService
  | ITaxRateService
  | ITrackingCategoryService
  | ITransactionService
  | IVendorCreditService;
