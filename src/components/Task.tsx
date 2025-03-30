import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  CheckSquare, 
  User, 
  Circle,
  Calendar
} from 'lucide-react';
import { Task as TaskType, TaskColor } from '../types';
import { useBoardStore } from '../store/boardStore';
import { TaskModal } from './TaskModal';

interface TaskProps {
  boardId: string;
  columnId: string;
  task: TaskType;
}

const getColorClasses = (color: TaskColor): { bg: string; border: string; ring: string } => {
  const classes = {
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', ring: 'ring-gray-400' },
    red: { bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-400' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-400' },
    green: { bg: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-400' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', ring: 'ring-purple-400' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', ring: 'ring-pink-400' },
  };
  return classes[color];
};

export function Task({ boardId, columnId, task }: TaskProps) {
  const { updateTask, toggleSubTask } = useBoardStore();
  const [showEditModal, setShowEditModal] = React.useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task: {
        ...task,
        columnId,
      },
    },
  });

  const colorClasses = getColorClasses(task.color);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 999 : undefined,
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const handleTaskUpdate = (updatedTask: {
    title: string;
    description: string;
    assignee: string;
    dueDate?: Date;
    color: TaskColor;
    attachments: any[];
    subTasks: any[];
  }) => {
    updateTask(boardId, columnId, task.id, {
      ...updatedTask,
      createdAt: task.createdAt,
    });
    setShowEditModal(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            setShowEditModal(true);
          }
        }}
        className={`
          ${colorClasses.bg} p-3 rounded-lg shadow-sm border ${colorClasses.border}
          cursor-move hover:shadow-md transition-shadow
          ${isDragging ? `shadow-lg ring-2 ${colorClasses.ring}` : ''}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-800">{task.title}</h3>
        </div>

        {task.description && (
          <div 
            className="text-sm text-gray-600 mb-2"
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
        )}

        {task.subTasks.length > 0 && (
          <div className="mb-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Subtasks</h4>
            <div className="space-y-1">
              {task.subTasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubTask(boardId, columnId, task.id, subtask.id);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {subtask.completed ? <CheckSquare size={16} /> : <Circle size={16} />}
                  </button>
                  <span className={subtask.completed ? 'line-through text-gray-400' : ''}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
          <div className="flex items-center gap-1">
            <User size={14} className="text-gray-400" />
            <span>{task.assignee || 'Unassigned'}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </div>

      <TaskModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSubmit={handleTaskUpdate}
        initialData={{
          title: task.title,
          description: task.description || '',
          assignee: task.assignee || '',
          dueDate: task.dueDate,
          color: task.color,
          attachments: task.attachments,
          subTasks: task.subTasks,
        }}
      />
    </>
  );
}