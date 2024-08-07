export type GreenhouseApplicationInput = Partial<{
  job_id: number;
  source_id: number;
  [key: string]: any;
  initial_stage_id: number;
  referrer: {
    type: 'id' | 'email' | 'outside';
    value: string;
  };
  attachments: Array<Attachments>;
}>;

type Attachments = {
  filename: string;
  type: string;
  content_type: ContentTypes;
} & (
  | {
      content: string;
      url?: never;
    }
  | {
      url: string;
      content?: never;
    }
);

type ContentTypes =
  | 'application/atom+xml'
  | 'application/javascript'
  | 'application/json'
  | 'application/msgpack'
  | 'application/msword'
  | 'application/pdf'
  | 'application/rss+xml'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-powerpoint'
  | 'application/xml'
  | 'application/x-www-form-urlencoded'
  | 'application/x-yaml'
  | 'application/zip'
  | 'multipart/form-data'
  | 'image/bmp'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/png'
  | 'image/tiff'
  | 'text/calendar'
  | 'text/css'
  | 'text/csv'
  | 'text/html'
  | 'text/javascript'
  | 'text/plain'
  | 'text/vcard'
  | 'video/mpeg';

export type GreenhouseApplicationOutput = {
  id: number;
  candidate_id: number;
  prospect: boolean;
  applied_at: Date;
  rejected_at: null;
  last_activity_at: Date;
  source: {
    id: number;
    public_name: string;
  };
  credited_to: {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    employee_id: null;
  };
  rejection_reason: {
    id: number;
    name: string;
    type: {
      id: number;
      name: string;
    };
  };
  rejection_details: null;
  jobs: [
    {
      id: number;
      name: string;
    },
  ];
  job_post_id: null;
  status: string;
  current_stage: {
    id: number;
    name: string;
  };
  answers: [];
  custom_fields: {
    birthday: string;
    bio: string;
  };
  prospective_office: null;
  prospective_department: null;
  prospect_detail: {
    prospect_pool: null;
    prospect_stage: null;
    prospect_owner: null;
  };
};
