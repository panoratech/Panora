export interface PipedriveTask {
  id: number;
  title: string;
  creator_id: number;
  description: string;
  done: number; // Assuming this is a numeric flag (0 or 1), can be changed to boolean if it represents true/false
  due_date: string;
  parent_task_id: number;
  assignee_id: number;
  add_time: string;
  update_time: string;
  marked_as_done_time: string;
  project_id: number;
  [key: string]: any;
}

export type PipedriveTaskInput = Partial<PipedriveTask>;
export type PipedriveTaskOutput = PipedriveTaskInput;
