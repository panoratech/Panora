export type GustoGroupOutput = Partial<{
  uuid: string;
  company_uuid: string;
  title: string;
  version: string;
  employees: [
    {
      uuid: string;
    },
  ];
  contractors: any[];
}>;
