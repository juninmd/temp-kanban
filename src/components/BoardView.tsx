import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, Star, StarOff, ArrowLeft } from 'lucide-react';
import type { Card, Column } from '../types';
import { useKanbanStore } from '../store/kanbanStore';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CardDetailModal } from './CardDetailModal';

interface BoardViewProps {
  boardId: string;
  onBack: () => void;
}

export function BoardView({ boardId, onBack }: BoardViewProps) {
  const { board, columns, cards, createColumn, toggleBoardStar, moveCard, moveColumn } =
    useKanbanStore((s) => ({
      board: s.boards[boardId],
      columns: s.columns,
      cards: s.cards,
      createColumn: s.createColumn,
      toggleBoardStar: s.toggleBoardStar,
      moveCard: s.moveCard,
      moveColumn: s.moveColumn,
    }));

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [detailCardId, setDetailCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  if (!board) return null;

  const boardColumns = board.columnIds.map((id) => columns[id]).filter(Boolean);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card as Card);
    } else if (active.data.current?.type === 'column') {
      setActiveColumn(active.data.current.column as Column);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'card' && overType === 'column') {
      const cardId = active.id as string;
      const toColumnId = over.data.current?.columnId as string;
      const card = cards[cardId];
      if (card && card.columnId !== toColumnId) {
        const toCol = columns[toColumnId];
        moveCard(cardId, toColumnId, toCol.cardIds.length);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'card' && overType === 'card') {
      const cardId = active.id as string;
      const overCardId = over.id as string;
      const activeCardData = cards[cardId];
      const overCardData = cards[overCardId];

      if (!activeCardData || !overCardData) return;

      const toColumnId = overCardData.columnId;
      const toCol = columns[toColumnId];
      const newIndex = toCol.cardIds.indexOf(overCardId);

      if (activeCardData.columnId === toColumnId) {
        const fromIndex = toCol.cardIds.indexOf(cardId);
        if (fromIndex !== newIndex) {
          const newCardIds = arrayMove(toCol.cardIds, fromIndex, newIndex);
          // Update column card order in store via moveCard reordering
          const idx = newCardIds.indexOf(cardId);
          moveCard(cardId, toColumnId, idx);
        }
      } else {
        moveCard(cardId, toColumnId, newIndex >= 0 ? newIndex : toCol.cardIds.length);
      }
    } else if (activeType === 'column' && overType === 'column') {
      const fromIndex = board.columnIds.indexOf(active.id as string);
      const toIndex = board.columnIds.indexOf(over.id as string);
      if (fromIndex !== toIndex) {
        moveColumn(boardId, fromIndex, toIndex);
      }
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(boardId, newColumnTitle.trim());
      setNewColumnTitle('');
      setAddingColumn(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br ${board.background}`}>
      {/* Board header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-black/20 backdrop-blur-sm">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-bold text-xl flex-1">{board.title}</h1>
        <button
          type="button"
          onClick={() => toggleBoardStar(boardId)}
          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          title={board.starred ? 'Unstar' : 'Star'}
        >
          {board.starred ? (
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Columns area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 p-4 h-full items-start board-scrollbar">
            <SortableContext
              items={board.columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {boardColumns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  onOpenCardDetail={(cardId) => setDetailCardId(cardId)}
                />
              ))}
            </SortableContext>

            {/* Add column */}
            {addingColumn ? (
              <div className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-3">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title..."
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-400 mb-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') { setAddingColumn(false); setNewColumnTitle(''); }
                  }}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  ref={(el) => el?.focus()}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Add column
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddingColumn(false); setNewColumnTitle(''); }}
                    className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingColumn(true)}
                className="flex-shrink-0 w-72 flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add another column
              </button>
            )}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="rotate-3 shadow-2xl w-72">
                <KanbanCard card={activeCard} onOpenDetail={() => {}} />
              </div>
            )}
            {activeColumn && (
              <div className="opacity-90 shadow-2xl w-72">
                <div className="bg-gray-100 rounded-xl p-3">
                  <p className="font-semibold text-sm text-gray-700">{activeColumn.title}</p>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card detail modal */}
      {detailCardId && (
        <CardDetailModal
          cardId={detailCardId}
          onClose={() => setDetailCardId(null)}
        />
      )}
    </div>
  );
}
