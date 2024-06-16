import { balancesheetUnificationMapping } from '@accounting/balancesheet/types/mappingsTypes';

import { cashflowstatementUnificationMapping } from '@accounting/cashflowstatement/types/mappingsTypes';

import { companyinfoUnificationMapping } from '@accounting/companyinfo/types/mappingsTypes';

import { creditnoteUnificationMapping } from '@accounting/creditnote/types/mappingsTypes';

import { IExpenseService } from '@accounting/expense/types';
import { expenseUnificationMapping } from '@accounting/expense/types/mappingsTypes';
import {
  UnifiedExpenseInput,
  UnifiedExpenseOutput,
} from '@accounting/expense/types/model.unified';
import { incomestatementUnificationMapping } from '@accounting/incomestatement/types/mappingsTypes';

import { IInvoiceService } from '@accounting/invoice/types';
import { invoiceUnificationMapping } from '@accounting/invoice/types/mappingsTypes';
import {
  UnifiedInvoiceInput,
  UnifiedInvoiceOutput,
} from '@accounting/invoice/types/model.unified';
import { IItemService } from '@accounting/item/types';
import { itemUnificationMapping } from '@accounting/item/types/mappingsTypes';
import {
  UnifiedItemInput,
  UnifiedItemOutput,
} from '@accounting/item/types/model.unified';
import { journalentryUnificationMapping } from '@accounting/journalentry/types/mappingsTypes';

import { IPaymentService } from '@accounting/payment/types';
import { paymentUnificationMapping } from '@accounting/payment/types/mappingsTypes';
import {
  UnifiedPaymentInput,
  UnifiedPaymentOutput,
} from '@accounting/payment/types/model.unified';
import { phonenumberUnificationMapping } from '@accounting/phonenumber/types/mappingsTypes';

import { purchaseorderUnificationMapping } from '@accounting/purchaseorder/types/mappingsTypes';

import { ITaxrateService } from '@accounting/taxrate/types';
import { taxrateUnificationMapping } from '@accounting/taxrate/types/mappingsTypes';
import {
  UnifiedTaxrateInput,
  UnifiedTaxrateOutput,
} from '@accounting/taxrate/types/model.unified';
import { trackingcategoryUnificationMapping } from '@accounting/trackingcategory/types/mappingsTypes';

import { ITransactionService } from '@accounting/transaction/types';
import { transactionUnificationMapping } from '@accounting/transaction/types/mappingsTypes';
import {
  UnifiedTransactionInput,
  UnifiedTransactionOutput,
} from '@accounting/transaction/types/model.unified';
import { vendorcreditUnificationMapping } from '@accounting/vendorcredit/types/mappingsTypes';

import { IContactService } from '@accounting/contact/types';
import { contactUnificationMapping } from '@accounting/contact/types/mappingsTypes';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@accounting/contact/types/model.unified';

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
  | UnifiedTaxrateInput
  | UnifiedTaxrateOutput
  | UnifiedTrackingCategoryInput
  | UnifiedTrackingCategoryOutput
  | UnifiedTransactionInput
  | UnifiedTransactionOutput
  | UnifiedVendorCreditInput
  | UnifiedVendorCreditOutput;

export const unificationMapping = {
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
};

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
  | ITaxrateService
  | ITrackingCategoryService
  | ITransactionService
  | IVendorCreditService;
