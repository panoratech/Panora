export type GorgiasTeamOutput = {
  id: number;
  uri: string;
  name: string;
  description: string;
  decoration: {
    emoji: string;
  };
  members: User[];
  created_datetime: string;
};

export type GorgiasTeamInput = Partial<GorgiasTeamOutput>;

interface User {
  id: number;
  name: string;
  email: string;
  meta: Meta;
}

interface Meta {
  [key: string]: any;
}
