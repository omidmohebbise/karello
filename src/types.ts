export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  file?: File;
  data?: string;
}

export type TaskColor = 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  dueDate?: Date;
  assignee?: string;
  color: TaskColor;
  attachments: Attachment[];
  subTasks: SubTask[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface SharedUser {
  email: string;
  role: 'viewer' | 'editor';
  sharedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  sharedWith: SharedUser[];
}