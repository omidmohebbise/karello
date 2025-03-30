import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Column } from './Column';
import { ColumnModal } from './ColumnModal';
import { useBoardStore } from '../store/boardStore';

interface BoardProps {
  boardId: string;
}

export function Board({ boardId }: BoardProps) {
  const { activeBoard, addColumn, moveTask, reorderColumns } = useBoardStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [showAddColumnModal, setShowAddColumnModal] = React.useState(false);
  const [activeColumn, setActiveColumn] = React.useState<any>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    if (active.data.current?.type === 'column') {
      setActiveColumn(active.data.current.column);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'task';
    const isOverATask = over.data.current?.type === 'task';
    const isActiveAColumn = active.data.current?.type === 'column';
    const isOverAColumn = over.data.current?.type === 'column';

    if (isActiveATask) {
      if (isOverATask) {
        const overTask = over.data.current?.task;
        if (!overTask) return;

        moveTask(
          boardId,
          active.data.current.task.columnId,
          overTask.columnId,
          activeId,
          overId
        );
      } else {
        moveTask(
          boardId,
          active.data.current.task.columnId,
          overId,
          activeId
        );
      }
    } else if (isActiveAColumn && isOverAColumn && activeBoard) {
      const oldIndex = activeBoard.columns.findIndex((col) => col.id === activeId);
      const newIndex = activeBoard.columns.findIndex((col) => col.id === overId);
      reorderColumns(boardId, oldIndex, newIndex);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'task';
    const isActiveAColumn = active.data.current?.type === 'column';

    if (isActiveATask) {
      moveTask(
        boardId,
        active.data.current.task.columnId,
        overId,
        activeId
      );
    } else if (isActiveAColumn && activeBoard) {
      const oldIndex = activeBoard.columns.findIndex((col) => col.id === activeId);
      const newIndex = activeBoard.columns.findIndex((col) => col.id === overId);
      reorderColumns(boardId, oldIndex, newIndex);
    }
  };

  if (!activeBoard) return null;

  return (
    <div className="h-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden pb-4">
          <SortableContext
            items={activeBoard.columns.map(col => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {activeBoard.columns.map((column) => (
              <Column
                key={column.id}
                boardId={boardId}
                column={column}
                isDropTarget={!activeId || activeId !== column.id}
              />
            ))}
          </SortableContext>

          {/* Empty Column for Adding New Column */}
          <div className="min-w-[280px] max-w-[350px]">
            <button
              onClick={() => setShowAddColumnModal(true)}
              className="w-full h-full min-h-[200px] rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600"
            >
              <Plus size={24} />
              <span className="font-medium">Add Column</span>
            </button>
          </div>
        </div>

        <DragOverlay>
          {activeColumn && (
            <div className="w-72 bg-white/90 rounded-lg p-2 shadow-2xl ring-2 ring-blue-400 rotate-3 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2 pl-8">
                <h2 className="font-semibold text-gray-700">{activeColumn.title}</h2>
                <span className="text-sm text-gray-500">
                  ({activeColumn.tasks.length})
                </span>
              </div>
              <div className="space-y-2 opacity-50 px-2">
                {activeColumn.tasks.slice(0, 3).map((task: any) => (
                  <div
                    key={task.id}
                    className="bg-white p-2 rounded shadow-sm border"
                  >
                    <h3 className="font-medium text-gray-800 truncate">
                      {task.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <ColumnModal
        show={showAddColumnModal}
        onHide={() => setShowAddColumnModal(false)}
        onSubmit={(title) => {
          addColumn(boardId, title);
          setShowAddColumnModal(false);
        }}
      />
    </div>
  );
}