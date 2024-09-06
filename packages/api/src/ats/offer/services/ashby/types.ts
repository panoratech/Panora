export interface AshbyOfferInput {
  id: string;
  decidedAt: string;
  applicationId: string;
  acceptanceStatus: string;
  offerStatus: string;
  latestVersion: {
    id: string;
    startDate: string;
    salary: {
      currencyCode: string;
      value: number;
    };
    createdAt: string;
    customFields: Array<{
      id: string;
      title: string;
      value: string;
    }>;
    fileHandles: Array<{
      id: string;
      name: string;
      handle: string;
    }>;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      globalRole: string;
      isEnabled: boolean;
      updatedAt: string;
    };
  };
  versions: Array<{
    id: string;
    startDate: string;
    salary: {
      currencyCode: string;
      value: number;
    };
    createdAt: string;
    customFields: Array<{
      id: string;
      title: string;
      value: string;
    }>;
    fileHandles: Array<{
      id: string;
      name: string;
      handle: string;
    }>;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      globalRole: string;
      isEnabled: boolean;
      updatedAt: string;
    };
  }>;
}

export type AshbyOfferOutput = Partial<AshbyOfferInput>;
