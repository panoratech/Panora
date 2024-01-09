export interface ZendeskTask {
  id: number; // Unique identifier of the task
  creator_id: number; // Unique identifier of the user who created the task
  owner_id?: number; // Unique identifier of the user the task is assigned to
  resource_type?: 'lead' | 'contact' | 'deal'; // Name of the resource type the task is attached to
  resource_id?: number; // Unique identifier of the resource the task is attached to
  completed?: boolean; // Indicator of whether the task is completed or not
  completed_at: string; // Date and time of the task's completion in UTC (ISO8601 format)
  due_date?: string; // Date and time of creation in UTC (ISO8601 format)
  overdue: boolean; // Indicator for whether the task has passed the due_date or not
  remind_at?: string; // Date and time that we should send you a reminder in UTC (ISO8601 format)
  content?: string; // Content of the task
  created_at: string; // Date and time of task creation in UTC (ISO8601 format)
  updated_at: string; // Date and t
}

export type ZendeskTaskInput = Partial<ZendeskTask>;
export type ZendeskTaskOutput = ZendeskTaskInput;
