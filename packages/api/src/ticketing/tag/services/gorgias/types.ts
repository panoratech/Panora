export type GorgiasTagOutput = {
  id: number;
  created_datetime: string; // ISO 8601 datetime format
  decoration: {
    color: string;
  };
  deleted_datetime: string | null; // ISO 8601 datetime format, nullable since a tag may not be deleted
  description: string;
  name: string;
  usage: number;
  uri: string;
};

export type GorgiasTagInput = Partial<GorgiasTagOutput>;
