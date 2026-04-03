import { useState } from 'react';
import { Plus, Star, Trash2, Layout, X } from 'lucide-react';
import { useKanbanStore } from '../store/kanbanStore';
import { BOARD_BACKGROUNDS } from '../utils';

interface HomeViewProps {
  onSelectBoard: (boardId: string) => void;
}

export function HomeView({ onSelectBoard }: HomeViewProps) {
  const { boards, createBoard, deleteBoard, toggleBoardStar } = useKanbanStore((s) => ({
    boards: s.boards,
    createBoard: s.createBoard,
    deleteBoard: s.deleteBoard,
    toggleBoardStar: s.toggleBoardStar,
  }));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBg, setNewBg] = useState(BOARD_BACKGROUNDS[0].value);

  const allBoards = Object.values(boards);
  const starredBoards = allBoards.filter((b) => b.starred);
  const regularBoards = allBoards.filter((b) => !b.starred);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createBoard(newTitle.trim(), newDesc.trim(), newBg);
    setNewTitle('');
    setNewDesc('');
    setNewBg(BOARD_BACKGROUNDS[0].value);
    setShowCreateModal(false);
  };

  const BoardCard = ({ board }: { board: (typeof allBoards)[0] }) => (
    <div className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer h-28">
      <button
        type="button"
        className={`absolute inset-0 bg-gradient-to-br ${board.background} w-full h-full`}
        onClick={() => onSelectBoard(board.id)}
      >
        <div className="p-3 text-left">
          <p className="text-white font-semibold text-sm leading-tight">{board.title}</p>
          {board.description && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2">{board.description}</p>
          )}
        </div>
      </button>

      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleBoardStar(board.id); }}
          className="p-1 rounded bg-black/30 hover:bg-black/50 text-white"
          title={board.starred ? 'Unstar' : 'Star'}
        >
          <Star className={`w-3.5 h-3.5 ${board.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }}
          className="p-1 rounded bg-black/30 hover:bg-red-500/80 text-white"
          title="Delete board"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">KanbanFlow</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New board
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Starred boards */}
        {starredBoards.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Starred Boards</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {starredBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </section>
        )}

        {/* All boards */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Your Boards</h2>
          </div>

          {regularBoards.length === 0 && allBoards.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Layout className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No boards yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first board to get started</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {regularBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
              {/* Create new board card */}
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors h-28 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">Create new board</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Create board modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowCreateModal(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Create new board</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview */}
            <div className={`h-24 rounded-xl bg-gradient-to-br ${newBg} mb-4 flex items-center justify-center`}>
              <p className="text-white font-semibold text-lg">{newTitle || 'Board name'}</p>
            </div>

            {/* Background picker */}
            <div className="flex flex-wrap gap-2 mb-4">
              {BOARD_BACKGROUNDS.map((bg) => (
                <button
                  type="button"
                  key={bg.value}
                  onClick={() => setNewBg(bg.value)}
                  className={`w-10 h-7 rounded-lg bg-gradient-to-br ${bg.value} ${
                    newBg === bg.value ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                  } transition-all`}
                  title={bg.label}
                />
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="board-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Board title <span className="text-red-500">*</span>
                </label>
                <input
                  id="board-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter board title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
              </div>
              <div>
                <label htmlFor="board-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  id="board-desc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create board
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
