export interface ShopifyCustomerInput {
  id: string;
  name: string;
  isArchived: boolean;
  parentId: string;
}

export type ShopifyCustomerOutput = Partial<ShopifyCustomerInput>;
