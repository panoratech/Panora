export type JiraTagInput = {
  id: string;
};

export type JiraTagOutput = {
  _links: TagLink;
  id: string;
  name: string;
  description: string;
  highlight: string | null;
  is_private: boolean;
  is_visible_in_conversation_lists: boolean;
  created_at: number;
  updated_at: number;
};

interface TagLink {
  self: string;
  related: {
    conversations: string;
    owner: string;
    parent_tag: string;
    children: string;
  };
}
