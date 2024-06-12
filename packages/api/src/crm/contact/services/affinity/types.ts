export interface AffinityContact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  }
  
  export type AffinityContactInput = Partial<AffinityContact>;
  export type AffinityContactOutput = AffinityContact;
  