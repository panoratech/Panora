export interface SquarespaceCustomerInput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hasAccount: boolean;
  isCustomer: boolean;
  createdOn: string;
  address: string | null;
  acceptsMarketing: boolean;
  transactionsSummary: TransactionsSummary;
}
type TransactionsSummary = {
  firstOrderSubmittedOn: string | null;
  lastOrderSubmittedOn: string | null;
  orderCount: number;
  totalOrderAmount: number | null;
  totalRefundAmount: number | null;
  firstDonationSubmittedOn: string | null;
  lastDonationSubmittedOn: string | null;
  donationCount: number;
  totalDonationAmount: number | null;
};

export type SquarespaceCustomerOutput = Partial<SquarespaceCustomerInput>;
