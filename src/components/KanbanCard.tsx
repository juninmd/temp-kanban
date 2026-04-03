import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckSquare, AlignLeft, Trash2 } from 'lucide-react';
import type { Card } from '../types';
import { useKanbanStore } from '../store/kanbanStore';
import { LABEL_COLOR_CLASSES, formatDueDate, isDueDateOverdue, isDueDateSoon } from '../utils';

interface KanbanCardProps {
  card: Card;
  onOpenDetail: (cardId: string) => void;
}

export function KanbanCard({ card, onOpenDetail }: KanbanCardProps) {
  const deleteCard = useKanbanStore((s) => s.deleteCard);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalItems = card.checklists.reduce((sum, cl) => sum + cl.items.length, 0);
  const completedItems = card.checklists.reduce(
    (sum, cl) => sum + cl.items.filter((i) => i.completed).length,
    0
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all ${
        isDragging ? 'rotate-2 shadow-lg' : ''
      }`}
    >
      {/* Cover color */}
      {card.coverColor && (
        <div
          className="h-8 rounded-t-lg"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Card content button (for opening detail) */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="w-full text-left p-3"
        onClick={() => onOpenDetail(card.id)}
      >
        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label) => {
              const colors = LABEL_COLOR_CLASSES[label.color];
              return (
                <span
                  key={label.id}
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-gray-800 leading-snug">{card.title}</p>

        {/* Meta row */}
        {(card.description || card.dueDate || totalItems > 0) && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {card.description && (
              <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
            )}
            {card.dueDate && (
              <span
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                  isDueDateOverdue(card.dueDate)
                    ? 'bg-red-100 text-red-700'
                    : isDueDateSoon(card.dueDate)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {formatDueDate(card.dueDate)}
              </span>
            )}
            {totalItems > 0 && (
              <span
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                  completedItems === totalItems
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                {completedItems}/{totalItems}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          deleteCard(card.id);
        }}
        className="absolute top-1 right-1 p-1 rounded bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete card"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
