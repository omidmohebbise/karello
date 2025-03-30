import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, GripVertical, Trash2 } from 'lucide-react';
import { Column as ColumnType } from '../types';
import { Task } from './Task';
import { TaskModal } from './TaskModal';
import { ColumnModal } from './ColumnModal';
import { useBoardStore } from '../store/boardStore';

interface ColumnProps {
  boardId: string;
  column: ColumnType;
  isDropTarget: boolean;
}

export function Column({ boardId, column, isDropTarget }: ColumnProps) {
  const { addTask, updateColumn, deleteColumn } = useBoardStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    assignee: string;
    dueDate?: Date;
    color: string;
    attachments: any[];
    subTasks: any[];
  }) => {
    addTask(boardId, column.id, taskData);
    setShowTaskModal(false);
  };

  const handleUpdateColumn = (title: string) => {
    updateColumn(boardId, column.id, title);
    setShowEditModal(false);
  };

  const handleDeleteColumn = () => {
    if (column.tasks.length === 0) {
      deleteColumn(boardId, column.id);
    }
  };

  return (
    <>
      <div 
        ref={setNodeRef}
        style={style}
        className={`
          min-w-[280px] max-w-[350px] rounded-lg
          ${isDragging ? 'opacity-0' : 'opacity-100'}
          transition-all duration-200 ease-in-out
        `}
      >
        <div
          ref={setDroppableRef}
          className={`
            bg-gray-100 p-2 rounded-lg
            ${isDragging ? 'opacity-0' : 'shadow-sm hover:shadow-md'}
            ${isOver && isDropTarget ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md' : ''}
            transition-all duration-200 ease-in-out
          `}
        >
          <div className="flex items-center gap-2 mb-2 group">
            <div
              {...attributes}
              {...listeners}
              className="p-1.5 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} className="text-gray-400 hover:text-gray-600" />
            </div>

            <div className="flex-1 flex items-center min-w-0 gap-1">
              <h2 className="font-semibold text-gray-700 truncate">{column.title}</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Pencil size={14} className="text-gray-500" />
              </button>
              <span className="text-sm text-gray-500 flex-shrink-0">({column.tasks.length})</span>
            </div>

            <div className="flex items-center gap-1">
              {column.tasks.length === 0 && (
                <button
                  onClick={handleDeleteColumn}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setShowTaskModal(true)}
                className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex-shrink-0 text-white"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div 
            className={`
              space-y-2 min-h-[200px] rounded-md px-2
              ${isOver && isDropTarget ? 'bg-blue-50/50 ring-2 ring-blue-500/20' : ''}
              ${isDragging ? 'opacity-50' : ''}
              transition-colors duration-200
            `}
          >
            <SortableContext
              items={column.tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {column.tasks.map((task) => (
                <Task
                  key={task.id}
                  boardId={boardId}
                  columnId={column.id}
                  task={task}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      </div>

      <TaskModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        onSubmit={handleAddTask}
      />

      <ColumnModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSubmit={handleUpdateColumn}
        initialTitle={column.title}
      />
    </>
  );
}