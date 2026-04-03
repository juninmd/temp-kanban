import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Tag, CheckSquare, AlignLeft, Trash2, Palette } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Label, LabelColor } from '../types';
import { useKanbanStore } from '../store/kanbanStore';
import { LABEL_COLOR_CLASSES } from '../utils';

interface CardDetailModalProps {
  cardId: string;
  onClose: () => void;
}

const LABEL_COLORS: LabelColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];

const COVER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#64748b',
  '#06b6d4', '#10b981', '#f59e0b', '#6366f1',
];

export function CardDetailModal({ cardId, onClose }: CardDetailModalProps) {
  const { cards, columns, updateCard, deleteCard, addLabelToCard, removeLabelFromCard,
    addChecklist, deleteChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem } =
    useKanbanStore((s) => ({
      cards: s.cards,
      columns: s.columns,
      updateCard: s.updateCard,
      deleteCard: s.deleteCard,
      addLabelToCard: s.addLabelToCard,
      removeLabelFromCard: s.removeLabelFromCard,
      addChecklist: s.addChecklist,
      deleteChecklist: s.deleteChecklist,
      addChecklistItem: s.addChecklistItem,
      updateChecklistItem: s.updateChecklistItem,
      deleteChecklistItem: s.deleteChecklistItem,
    }));

  const card = cards[cardId];

  const [titleDraft, setTitleDraft] = useState(card?.title ?? '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(card?.description ?? '');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<LabelColor>('blue');
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
    }
  }, [editingTitle]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!card) return null;

  const columnName = columns[card.columnId]?.title ?? '';

  const handleTitleSave = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== card.title) {
      updateCard(cardId, { title: trimmed });
    } else {
      setTitleDraft(card.title);
    }
    setEditingTitle(false);
  };

  const handleDescSave = () => {
    if (descDraft !== card.description) {
      updateCard(cardId, { description: descDraft });
    }
    setEditingDesc(false);
  };

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    const label: Label = {
      id: uuidv4(),
      name: newLabelName.trim(),
      color: newLabelColor,
    };
    addLabelToCard(cardId, label);
    setNewLabelName('');
    setShowLabelPicker(false);
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    addChecklist(cardId, newChecklistTitle.trim());
    setNewChecklistTitle('');
    setShowChecklistInput(false);
  };

  const handleAddItem = (checklistId: string) => {
    const text = newItemTexts[checklistId] ?? '';
    if (!text.trim()) return;
    addChecklistItem(cardId, checklistId, text.trim());
    setNewItemTexts((prev) => ({ ...prev, [checklistId]: '' }));
  };

  const totalItems = card.checklists.reduce((sum, cl) => sum + cl.items.length, 0);
  const completedItems = card.checklists.reduce(
    (sum, cl) => sum + cl.items.filter((i) => i.completed).length,
    0
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative">
        {/* Cover */}
        {card.coverColor && (
          <div className="h-16 rounded-t-xl" style={{ backgroundColor: card.coverColor }} />
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Column indicator */}
          <p className="text-xs text-gray-500 mb-2 font-medium">In: {columnName}</p>

          {/* Title */}
          <div className="mb-4">
            {editingTitle ? (
              <textarea
                ref={titleRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTitleSave(); }
                  if (e.key === 'Escape') { setTitleDraft(card.title); setEditingTitle(false); }
                }}
                className="w-full text-xl font-bold text-gray-900 bg-gray-50 border border-blue-400 rounded-lg px-3 py-2 outline-none resize-none"
                rows={2}
              />
            ) : (
              <button
                type="button"
                className="w-full text-left text-xl font-bold text-gray-900 hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 -my-1 bg-transparent border-0"
                onClick={() => { setTitleDraft(card.title); setEditingTitle(true); }}
              >
                {card.title}
              </button>
            )}
          </div>

          <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1 space-y-5">
              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Description</span>
                </div>
                {editingDesc ? (
                  <div>
                    <textarea
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      placeholder="Add a description..."
                      className="w-full bg-gray-50 border border-blue-400 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={handleDescSave}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDescDraft(card.description); setEditingDesc(false); }}
                        className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setDescDraft(card.description); setEditingDesc(true); }}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 min-h-[60px] border-0"
                  >
                    {card.description || <span className="text-gray-400">Add a description...</span>}
                  </button>
                )}
              </div>

              {/* Checklists */}
              {card.checklists.map((checklist) => {
                const clTotal = checklist.items.length;
                const clCompleted = checklist.items.filter((i) => i.completed).length;
                const clProgress = clTotal > 0 ? Math.round((clCompleted / clTotal) * 100) : 0;
                return (
                  <div key={checklist.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">{checklist.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{clCompleted}/{clTotal}</span>
                        <button
                          type="button"
                          onClick={() => deleteChecklist(cardId, checklist.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${clProgress}%` }}
                      />
                    </div>
                    {/* Items */}
                    <div className="space-y-1">
                      {checklist.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 group/item">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) =>
                              updateChecklistItem(cardId, checklist.id, item.id, {
                                completed: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span
                            className={`flex-1 text-sm ${
                              item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            {item.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteChecklistItem(cardId, checklist.id, item.id)}
                            className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Add item */}
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newItemTexts[checklist.id] ?? ''}
                        onChange={(e) =>
                          setNewItemTexts((prev) => ({ ...prev, [checklist.id]: e.target.value }))
                        }
                        placeholder="Add an item..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddItem(checklist.id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem(checklist.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Checklist total progress if multiple */}
              {totalItems > 0 && card.checklists.length > 1 && (
                <div className="text-xs text-gray-500">
                  Overall: {completedItems}/{totalItems} items completed
                </div>
              )}
            </div>

            {/* Sidebar actions */}
            <div className="w-40 space-y-2 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</p>

              {/* Labels */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLabelPicker(!showLabelPicker)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Labels
                </button>

                {showLabelPicker && (
                  <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-56">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Current labels</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.labels.map((label) => {
                        const colors = LABEL_COLOR_CLASSES[label.color];
                        return (
                          <button
                            type="button"
                            key={label.id}
                            onClick={() => removeLabelFromCard(cardId, label.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} hover:opacity-80`}
                            title="Click to remove"
                          >
                            {label.name}
                            <X className="w-3 h-3" />
                          </button>
                        );
                      })}
                      {card.labels.length === 0 && (
                        <span className="text-xs text-gray-400">No labels</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Add label</p>
                    <input
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Label name..."
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 mb-2"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); }}
                    />
                    <div className="flex flex-wrap gap-1 mb-2">
                      {LABEL_COLORS.map((color) => {
                        const colors = LABEL_COLOR_CLASSES[color];
                        return (
                          <button
                            type="button"
                            key={color}
                            onClick={() => setNewLabelColor(color)}
                            className={`w-6 h-6 rounded ${colors.bg} ${
                              newLabelColor === color ? 'ring-2 ring-offset-1 ring-gray-800' : ''
                            }`}
                          />
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLabel}
                      className="w-full px-2 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                    >
                      Add label
                    </button>
                  </div>
                )}
              </div>

              {/* Due date */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Due date
                </p>
                <input
                  type="date"
                  value={card.dueDate ? card.dueDate.substring(0, 10) : ''}
                  onChange={(e) =>
                    updateCard(cardId, {
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400"
                />
              </div>

              {/* Cover color */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(!showCoverPicker)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Cover
                </button>
                {showCoverPicker && (
                  <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {COVER_COLORS.map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => {
                            updateCard(cardId, { coverColor: color });
                            setShowCoverPicker(false);
                          }}
                          className={`w-8 h-8 rounded ${
                            card.coverColor === color ? 'ring-2 ring-offset-1 ring-gray-800' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateCard(cardId, { coverColor: null });
                        setShowCoverPicker(false);
                      }}
                      className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                    >
                      Remove cover
                    </button>
                  </div>
                )}
              </div>

              {/* Add checklist */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowChecklistInput(!showChecklistInput)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Checklist
                </button>
                {showChecklistInput && (
                  <div className="mt-2 space-y-1">
                    <input
                      type="text"
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      placeholder="Checklist title..."
                      className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklist(); }}
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleAddChecklist}
                        className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowChecklistInput(false)}
                        className="flex-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete card */}
              <button
                type="button"
                onClick={() => {
                  deleteCard(cardId);
                  onClose();
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-sm text-red-600 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
