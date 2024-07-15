import { IExpenseService } from '@accounting/expense/types';
import {
  UnifiedExpenseInput,
  UnifiedExpenseOutput,
} from '@accounting/expense/types/model.unified';
import { IInvoiceService } from '@accounting/invoice/types';
import {
  UnifiedInvoiceInput,
  UnifiedInvoiceOutput,
} from '@accounting/invoice/types/model.unified';
import { IItemService } from '@accounting/item/types';
import {
  UnifiedItemInput,
  UnifiedItemOutput,
} from '@accounting/item/types/model.unified';
import { IPaymentService } from '@accounting/payment/types';
import {
  UnifiedPaymentInput,
  UnifiedPaymentOutput,
} from '@accounting/payment/types/model.unified';
import { ITaxRateService } from '@accounting/taxrate/types';
import {
  UnifiedTaxRateInput,
  UnifiedTaxRateOutput,
} from '@accounting/taxrate/types/model.unified';
import { ITransactionService } from '@accounting/transaction/types';
import {
  UnifiedTransactionInput,
  UnifiedTransactionOutput,
} from '@accounting/transaction/types/model.unified';
import { IContactService } from '@accounting/contact/types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@accounting/contact/types/model.unified';
import {
  UnifiedBalanceSheetInput,
  UnifiedBalanceSheetOutput,
} from '@accounting/balancesheet/types/model.unified';
import {
  UnifiedCashflowStatementInput,
  UnifiedCashflowStatementOutput,
} from '@accounting/cashflowstatement/types/model.unified';
import {
  UnifiedCompanyInfoInput,
  UnifiedCompanyInfoOutput,
} from '@accounting/companyinfo/types/model.unified';
import {
  UnifiedCreditNoteInput,
  UnifiedCreditNoteOutput,
} from '@accounting/creditnote/types/model.unified';
import {
  UnifiedIncomeStatementInput,
  UnifiedIncomeStatementOutput,
} from '@accounting/incomestatement/types/model.unified';
import {
  UnifiedJournalEntryInput,
  UnifiedJournalEntryOutput,
} from '@accounting/journalentry/types/model.unified';
import {
  UnifiedPhoneNumberInput,
  UnifiedPhoneNumberOutput,
} from '@accounting/phonenumber/types/model.unified';
import {
  UnifiedPurchaseOrderInput,
  UnifiedPurchaseOrderOutput,
} from '@accounting/purchaseorder/types/model.unified';
import {
  UnifiedTrackingCategoryInput,
  UnifiedTrackingCategoryOutput,
} from '@accounting/trackingcategory/types/model.unified';
import {
  UnifiedVendorCreditInput,
  UnifiedVendorCreditOutput,
} from '@accounting/vendorcredit/types/model.unified';
import { IBalanceSheetService } from '@accounting/balancesheet/types';
import { ICashflowStatementService } from '@accounting/cashflowstatement/types';
import { ICreditNoteService } from '@accounting/creditnote/types';
import { IJournalEntryService } from '@accounting/journalentry/types';
import { IIncomeStatementService } from '@accounting/incomestatement/types';
import { IPurchaseOrderService } from '@accounting/purchaseorder/types';
import { ITrackingCategoryService } from '@accounting/trackingcategory/types';
import { IVendorCreditService } from '@accounting/vendorcredit/types';
import { ICompanyInfoService } from '@accounting/companyinfo/types';
import { IPhoneNumberService } from '@accounting/phonenumber/types';

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
}

export type UnifiedAccounting =
  | UnifiedBalanceSheetInput
  | UnifiedBalanceSheetOutput
  | UnifiedCashflowStatementInput
  | UnifiedCashflowStatementOutput
  | UnifiedCompanyInfoInput
  | UnifiedCompanyInfoOutput
  | UnifiedContactInput
  | UnifiedContactOutput
  | UnifiedCreditNoteInput
  | UnifiedCreditNoteOutput
  | UnifiedExpenseInput
  | UnifiedExpenseOutput
  | UnifiedIncomeStatementInput
  | UnifiedIncomeStatementOutput
  | UnifiedInvoiceInput
  | UnifiedInvoiceOutput
  | UnifiedItemInput
  | UnifiedItemOutput
  | UnifiedJournalEntryInput
  | UnifiedJournalEntryOutput
  | UnifiedPaymentInput
  | UnifiedPaymentOutput
  | UnifiedPhoneNumberInput
  | UnifiedPhoneNumberOutput
  | UnifiedPurchaseOrderInput
  | UnifiedPurchaseOrderOutput
  | UnifiedTaxRateInput
  | UnifiedTaxRateOutput
  | UnifiedTrackingCategoryInput
  | UnifiedTrackingCategoryOutput
  | UnifiedTransactionInput
  | UnifiedTransactionOutput
  | UnifiedVendorCreditInput
  | UnifiedVendorCreditOutput;

/*export const unificationMapping = {
  [AccountingObject.balancesheet]: balancesheetUnificationMapping,
  [AccountingObject.cashflowstatement]: cashflowstatementUnificationMapping,
  [AccountingObject.companyinfo]: companyinfoUnificationMapping,
  [AccountingObject.contact]: contactUnificationMapping,
  [AccountingObject.creditnote]: creditnoteUnificationMapping,
  [AccountingObject.expense]: expenseUnificationMapping,
  [AccountingObject.incomestatement]: incomestatementUnificationMapping,
  [AccountingObject.invoice]: invoiceUnificationMapping,
  [AccountingObject.item]: itemUnificationMapping,
  [AccountingObject.journalentry]: journalentryUnificationMapping,
  [AccountingObject.payment]: paymentUnificationMapping,
  [AccountingObject.phonenumber]: phonenumberUnificationMapping,
  [AccountingObject.purchaseorder]: purchaseorderUnificationMapping,
  [AccountingObject.taxrate]: taxrateUnificationMapping,
  [AccountingObject.trackingcategory]: trackingcategoryUnificationMapping,
  [AccountingObject.transaction]: transactionUnificationMapping,
  [AccountingObject.vendorcredit]: vendorcreditUnificationMapping,
};*/

export type IAccountingService =
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
