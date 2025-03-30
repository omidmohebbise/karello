import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, Column, Task, SubTask, Attachment, SharedUser } from '../types';

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  addBoard: (title: string) => void;
  deleteBoard: (boardId: string) => void;
  setActiveBoard: (boardId: string) => void;
  addColumn: (boardId: string, title: string) => void;
  updateColumn: (boardId: string, columnId: string, title: string) => void;
  reorderColumns: (boardId: string, startIndex: number, endIndex: number) => void;
  addTask: (boardId: string, columnId: string, task: Partial<Task>) => void;
  updateTask: (boardId: string, columnId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (boardId: string, columnId: string, taskId: string) => void;
  addSubTask: (boardId: string, columnId: string, taskId: string, title: string) => void;
  toggleSubTask: (boardId: string, columnId: string, taskId: string, subTaskId: string) => void;
  addAttachment: (boardId: string, columnId: string, taskId: string, attachment: Attachment) => void;
  moveTask: (boardId: string, fromColumnId: string, toColumnId: string, taskId: string, targetTaskId?: string) => void;
  shareBoard: (boardId: string, email: string, role: 'viewer' | 'editor') => void;
  removeSharedUser: (boardId: string, email: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
}

const createDefaultTask = (): Task => ({
  id: crypto.randomUUID(),
  title: 'Welcome! 👋',
  description: 'This is your first task. Feel free to edit or delete it.',
  createdAt: new Date(),
  color: 'blue',
  attachments: [],
  subTasks: [],
});

const createDefaultColumn = (): Column => ({
  id: crypto.randomUUID(),
  title: 'To Do',
  tasks: [createDefaultTask()],
});

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: [],
      activeBoard: null,

      addBoard: (title) => {
        const newBoard: Board = {
          id: crypto.randomUUID(),
          title,
          columns: [createDefaultColumn()],
          sharedWith: [],
        };

        set((state) => ({
          boards: [newBoard, ...state.boards],
          activeBoard: newBoard,
        }));
      },

      deleteBoard: (boardId) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board || board.columns.some(col => col.tasks.length > 0)) {
            return state;
          }

          const newBoards = state.boards.filter((b) => b.id !== boardId);
          return {
            boards: newBoards,
            activeBoard: state.activeBoard?.id === boardId ? null : state.activeBoard,
          };
        });
      },

      setActiveBoard: (boardId) => {
        const state = get();
        const board = state.boards.find((b) => b.id === boardId);
        
        const updatedBoard = board ? {
          ...board,
          sharedWith: board.sharedWith || [],
        } : null;

        set({
          activeBoard: updatedBoard,
          boards: state.boards.map(b => 
            b.id === boardId ? { ...b, sharedWith: b.sharedWith || [] } : b
          ),
        });
      },

      addColumn: (boardId, title) => {
        const newColumn: Column = {
          id: crypto.randomUUID(),
          title,
          tasks: [],
        };

        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? { ...board, columns: [...board.columns, newColumn] }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? { ...state.activeBoard, columns: [...state.activeBoard.columns, newColumn] }
            : state.activeBoard,
        }));
      },

      updateColumn: (boardId, columnId, title) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? { ...column, title }
                      : column
                  ),
                }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? {
                ...state.activeBoard,
                columns: state.activeBoard.columns.map((column) =>
                  column.id === columnId
                    ? { ...column, title }
                    : column
                ),
              }
            : state.activeBoard,
        }));
      },

      deleteColumn: (boardId, columnId) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.filter((column) => column.id !== columnId),
                }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? {
                ...state.activeBoard,
                columns: state.activeBoard.columns.filter((column) => column.id !== columnId),
              }
            : state.activeBoard,
        }));
      },

      reorderColumns: (boardId, startIndex, endIndex) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;

          const newColumns = [...board.columns];
          const [removed] = newColumns.splice(startIndex, 1);
          newColumns.splice(endIndex, 0, removed);

          const updatedBoard = { ...board, columns: newColumns };

          return {
            boards: state.boards.map((b) =>
              b.id === boardId ? updatedBoard : b
            ),
            activeBoard: state.activeBoard?.id === boardId
              ? updatedBoard
              : state.activeBoard,
          };
        });
      },

      addTask: (boardId, columnId, taskData) => {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskData.title || 'New Task',
          description: taskData.description || '',
          createdAt: new Date(),
          color: taskData.color || 'gray',
          assignee: taskData.assignee || '',
          attachments: [],
          subTasks: [],
        };

        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? { ...column, tasks: [...column.tasks, newTask] }
                      : column
                  ),
                }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? {
                ...state.activeBoard,
                columns: state.activeBoard.columns.map((column) =>
                  column.id === columnId
                    ? { ...column, tasks: [...column.tasks, newTask] }
                    : column
                ),
              }
            : state.activeBoard,
        }));
      },

      updateTask: (boardId, columnId, taskId, updates) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: column.tasks.map((task) =>
                            task.id === taskId
                              ? { ...task, ...updates }
                              : task
                          ),
                        }
                      : column
                  ),
                }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? {
                ...state.activeBoard,
                columns: state.activeBoard.columns.map((column) =>
                  column.id === columnId
                    ? {
                        ...column,
                        tasks: column.tasks.map((task) =>
                          task.id === taskId
                            ? { ...task, ...updates }
                            : task
                        ),
                      }
                    : column
                ),
              }
            : state.activeBoard,
        }));
      },

      deleteTask: (boardId, columnId, taskId) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: column.tasks.filter((task) => task.id !== taskId),
                        }
                      : column
                  ),
                }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? {
                ...state.activeBoard,
                columns: state.activeBoard.columns.map((column) =>
                  column.id === columnId
                    ? {
                        ...column,
                        tasks: column.tasks.filter((task) => task.id !== taskId),
                      }
                    : column
                ),
              }
            : state.activeBoard,
        }));
      },

      addSubTask: (boardId, columnId, taskId, title) => {
        const newSubTask: SubTask = {
          id: crypto.randomUUID(),
          title,
          completed: false,
        };

        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: column.tasks.map((task) =>
                            task.id === taskId
                              ? {
                                  ...task,
                                  subTasks: [...task.subTasks, newSubTask],
                                }
                              : task
                          ),
                        }
                      : column
                  ),
                }
              : board
          ),
        }));
      },

      toggleSubTask: (boardId, columnId, taskId, subTaskId) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: column.tasks.map((task) =>
                            task.id === taskId
                              ? {
                                  ...task,
                                  subTasks: task.subTasks.map((subtask) =>
                                    subtask.id === subTaskId
                                      ? {
                                          ...subtask,
                                          completed: !subtask.completed,
                                        }
                                      : subtask
                                  ),
                                }
                              : task
                          ),
                        }
                      : column
                  ),
                }
              : board
          ),
        }));
      },

      addAttachment: (boardId, columnId, taskId, attachment) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: column.tasks.map((task) =>
                            task.id === taskId
                              ? {
                                  ...task,
                                  attachments: [...task.attachments, attachment],
                                }
                              : task
                          ),
                        }
                      : column
                  ),
                }
              : board
          ),
        }));
      },

      moveTask: (boardId, fromColumnId, toColumnId, taskId, targetTaskId) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;

          const fromColumn = board.columns.find((c) => c.id === fromColumnId);
          const toColumn = board.columns.find((c) => c.id === toColumnId);
          if (!fromColumn || !toColumn) return state;

          const taskToMove = fromColumn.tasks.find((t) => t.id === taskId);
          if (!taskToMove) return state;

          const sourceColumnTasks = fromColumn.tasks.filter((t) => t.id !== taskId);

          let targetIndex = toColumn.tasks.length;
          if (targetTaskId) {
            targetIndex = toColumn.tasks.findIndex((t) => t.id === targetTaskId);
            if (targetIndex === -1) targetIndex = toColumn.tasks.length;
          }

          const destinationColumnTasks = [...toColumn.tasks];
          destinationColumnTasks.splice(targetIndex, 0, taskToMove);

          const updatedColumns = board.columns.map((column) => {
            if (column.id === fromColumnId) {
              return { ...column, tasks: sourceColumnTasks };
            }
            if (column.id === toColumnId) {
              return { ...column, tasks: destinationColumnTasks };
            }
            return column;
          });

          const updatedBoard = { ...board, columns: updatedColumns };

          return {
            boards: state.boards.map((b) =>
              b.id === boardId ? updatedBoard : b
            ),
            activeBoard: state.activeBoard?.id === boardId
              ? updatedBoard
              : state.activeBoard,
          };
        });
      },

      shareBoard: (boardId, email, role) => {
        const newSharedUser: SharedUser = {
          email,
          role,
          sharedAt: new Date(),
        };

        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  sharedWith: [...(board.sharedWith || []), newSharedUser],
                }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? {
                ...state.activeBoard,
                sharedWith: [...(state.activeBoard.sharedWith || []), newSharedUser],
              }
            : state.activeBoard,
        }));
      },

      removeSharedUser: (boardId, email) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  sharedWith: (board.sharedWith || []).filter((user) => user.email !== email),
                }
              : board
          ),
          activeBoard: state.activeBoard?.id === boardId
            ? {
                ...state.activeBoard,
                sharedWith: (state.activeBoard.sharedWith || []).filter((user) => user.email !== email),
              }
            : state.activeBoard,
        }));
      },
    }),
    {
      name: 'board-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.boards = state.boards.map(board => ({
            ...board,
            sharedWith: board.sharedWith || [],
          }));
          
          if (state.activeBoard) {
            state.activeBoard = {
              ...state.activeBoard,
              sharedWith: state.activeBoard.sharedWith || [],
            };
          }
        }
      },
    }
  )
);