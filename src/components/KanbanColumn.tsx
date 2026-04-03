import { useState, useRef, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, Trash2, GripVertical } from 'lucide-react';
import type { Column } from '../types';
import { useKanbanStore } from '../store/kanbanStore';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  onOpenCardDetail: (cardId: string) => void;
}

export function KanbanColumn({ column, onOpenCardDetail }: KanbanColumnProps) {
  const { cards, updateColumn, deleteColumn, createCard } = useKanbanStore((s) => ({
    cards: s.cards,
    updateColumn: s.updateColumn,
    deleteColumn: s.deleteColumn,
    createCard: s.createCard,
  }));

  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const addCardRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingCard && addCardRef.current) {
      addCardRef.current.focus();
    }
  }, [addingCard]);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  const columnCards = column.cardIds.map((id) => cards[id]).filter(Boolean);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column', column },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      createCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setAddingCard(false);
    }
  };

  const handleTitleSave = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== column.title) {
      updateColumn(column.id, { title: trimmed });
    } else {
      setTitleDraft(column.title);
    }
    setEditingTitle(false);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`flex-shrink-0 w-72 flex flex-col bg-gray-100 rounded-xl max-h-full ${
        isDragging ? 'shadow-2xl' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') {
                setTitleDraft(column.title);
                setEditingTitle(false);
              }
            }}
            className="flex-1 font-semibold text-sm text-gray-700 bg-white border border-blue-400 rounded px-2 py-0.5 outline-none"
          />
        ) : (
          <button
            type="button"
            className="flex-1 font-semibold text-sm text-gray-700 text-left hover:text-gray-900 bg-transparent border-0 p-0"
            onClick={() => setEditingTitle(true)}
          >
            {column.title}
          </button>
        )}

        <span className="text-xs text-gray-500 font-medium">{columnCards.length}</span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-40 py-1">
              <button
                type="button"
                onClick={() => {
                  deleteColumn(column.id);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards list */}
      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-2 min-h-[2rem]"
      >
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {columnCards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onOpenDetail={onOpenCardDetail}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card area */}
      <div className="px-2 pb-2">
        {addingCard ? (
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <textarea
              ref={addCardRef}
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full resize-none text-sm text-gray-800 outline-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard();
                }
                if (e.key === 'Escape') {
                  setAddingCard(false);
                  setNewCardTitle('');
                }
              }}
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handleAddCard}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingCard(false);
                  setNewCardTitle('');
                }}
                className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCard(true)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
