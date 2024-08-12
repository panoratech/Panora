export interface AmazonCustomerOutput {
  BuyerEmail: string;
  BuyerName: string;
  Address?: Partial<{
    Name: string;
    AddressLine1: string;
    City: string;
    StateOrRegion: string;
    PostalCode: string;
    CountryCode: string;
  }>;
}
