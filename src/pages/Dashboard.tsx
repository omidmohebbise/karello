import React, { useEffect, useState } from 'react';
import { Layout, Plus, Share2, Trash2 } from 'lucide-react';
import { Board } from '../components/Board';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { ShareModal } from '../components/ShareModal';
import { BoardModal } from '../components/BoardModal';

export function Dashboard() {
  const { boards, activeBoard, addBoard, setActiveBoard, deleteBoard } = useBoardStore();
  const { logout } = useAuthStore();
  const [showBoardModal, setShowBoardModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('board');
    if (boardId) {
      setActiveBoard(boardId);
    }
  }, [setActiveBoard]);

  const handleAddBoard = (title: string) => {
    addBoard(title);
  };

  const handleDeleteBoard = (boardId: string) => {
    deleteBoard(boardId);
    if (activeBoard?.id === boardId) {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold">Karello1</span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-full flex flex-col">
            <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setShowBoardModal(true)}
                className="min-w-[200px] h-[120px] rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600 group relative"
              >
                <Plus size={24} />
                <span className="font-medium">Add a new board</span>
                <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-sm rounded px-2 py-1 -bottom-8">
                  Add a new board
                </div>
              </button>
              {boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  isActive={activeBoard?.id === board.id}
                  onSelect={() => {
                    setActiveBoard(board.id);
                    const url = new URL(window.location.href);
                    url.searchParams.set('board', board.id);
                    window.history.pushState({}, '', url.toString());
                  }}
                  onDelete={() => handleDeleteBoard(board.id)}
                />
              ))}
            </div>
            {activeBoard && <Board boardId={activeBoard.id} />}
          </div>
        </div>
      </main>

      <BoardModal
        show={showBoardModal}
        onHide={() => setShowBoardModal(false)}
        onSubmit={handleAddBoard}
      />
    </div>
  );
}

interface BoardCardProps {
  board: {
    id: string;
    title: string;
    columns: { tasks: any[] }[];
    sharedWith?: { email: string; role: 'viewer' | 'editor'; sharedAt: Date }[];
  };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function BoardCard({ board, isActive, onSelect, onDelete }: BoardCardProps) {
  const { shareBoard, removeSharedUser } = useBoardStore();
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = (email: string, role: 'viewer' | 'editor') => {
    shareBoard(board.id, email, role);
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const getRoleColor = (role: 'viewer' | 'editor') => {
    return role === 'editor' ? 'bg-blue-500' : 'bg-gray-500';
  };

  const isEmpty = board.columns.every(col => col.tasks.length === 0);

  return (
    <>
      <div
        className={`
          relative group
          min-w-[200px] h-[120px] rounded-lg transition-all cursor-pointer
          ${isActive
            ? 'bg-blue-500 text-white shadow-md scale-105'
            : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-105'
          }
        `}
      >
        <button
          onClick={onSelect}
          className="w-full h-full p-4 text-left"
        >
          <div className="flex flex-col h-full">
            <span className="text-lg font-medium mb-2">{board.title}</span>
            {board.sharedWith?.length > 0 && (
              <div className="mt-auto flex items-center justify-end -space-x-2">
                {board.sharedWith.map((user) => (
                  <div
                    key={user.email}
                    className="relative group/user"
                    title={`${user.email} (${user.role})`}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                      ${getRoleColor(user.role)} border-2 border-white
                    `}>
                      {getInitials(user.email)}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/user:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                      {user.email}
                      <br />
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </button>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareModal(true);
            }}
            className={`
              p-2 rounded-full
              bg-opacity-10 backdrop-blur-sm
              ${isActive
                ? 'bg-white text-white hover:bg-white hover:bg-opacity-20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              transition-all duration-200
            `}
            title="Share board"
          >
            <Share2 size={16} />
          </button>
          {isEmpty && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={`
                p-2 rounded-full
                bg-opacity-10 backdrop-blur-sm
                ${isActive
                  ? 'bg-white text-white hover:bg-white hover:bg-opacity-20'
                  : 'bg-gray-100 text-red-600 hover:bg-red-100'
                }
                transition-all duration-200
              `}
              title="Delete empty board"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <ShareModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        sharedUsers={board.sharedWith || []}
        onShare={handleShare}
        onRemove={(email) => removeSharedUser(board.id, email)}
      />
    </>
  );
}