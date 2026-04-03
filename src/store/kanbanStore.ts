import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Board, Column, Card, Label, KanbanState, ChecklistItem, Checklist } from '../types';

const DEMO_BOARD_ID = uuidv4();
const TODO_COL_ID = uuidv4();
const IN_PROGRESS_COL_ID = uuidv4();
const REVIEW_COL_ID = uuidv4();
const DONE_COL_ID = uuidv4();

const CARD1_ID = uuidv4();
const CARD2_ID = uuidv4();
const CARD3_ID = uuidv4();
const CARD4_ID = uuidv4();
const CARD5_ID = uuidv4();

const initialBoards: Record<string, Board> = {
  [DEMO_BOARD_ID]: {
    id: DEMO_BOARD_ID,
    title: 'My First Board',
    description: 'A demo kanban board to get you started',
    background: 'from-blue-600 to-blue-800',
    columnIds: [TODO_COL_ID, IN_PROGRESS_COL_ID, REVIEW_COL_ID, DONE_COL_ID],
    createdAt: new Date().toISOString(),
    starred: false,
  },
};

const initialColumns: Record<string, Column> = {
  [TODO_COL_ID]: {
    id: TODO_COL_ID,
    title: 'To Do',
    boardId: DEMO_BOARD_ID,
    order: 0,
    cardIds: [CARD1_ID, CARD2_ID],
  },
  [IN_PROGRESS_COL_ID]: {
    id: IN_PROGRESS_COL_ID,
    title: 'In Progress',
    boardId: DEMO_BOARD_ID,
    order: 1,
    cardIds: [CARD3_ID],
  },
  [REVIEW_COL_ID]: {
    id: REVIEW_COL_ID,
    title: 'Review',
    boardId: DEMO_BOARD_ID,
    order: 2,
    cardIds: [CARD4_ID],
  },
  [DONE_COL_ID]: {
    id: DONE_COL_ID,
    title: 'Done',
    boardId: DEMO_BOARD_ID,
    order: 3,
    cardIds: [CARD5_ID],
  },
};

const initialCards: Record<string, Card> = {
  [CARD1_ID]: {
    id: CARD1_ID,
    title: 'Set up project structure',
    description: 'Initialize the project with all necessary dependencies and configuration files.',
    labels: [{ id: uuidv4(), name: 'Setup', color: 'blue' }],
    dueDate: null,
    checklists: [],
    coverColor: null,
    columnId: TODO_COL_ID,
    order: 0,
    createdAt: new Date().toISOString(),
  },
  [CARD2_ID]: {
    id: CARD2_ID,
    title: 'Design database schema',
    description: '',
    labels: [{ id: uuidv4(), name: 'Backend', color: 'purple' }],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    checklists: [],
    coverColor: null,
    columnId: TODO_COL_ID,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  [CARD3_ID]: {
    id: CARD3_ID,
    title: 'Build authentication system',
    description: 'Implement JWT-based authentication with refresh tokens.',
    labels: [
      { id: uuidv4(), name: 'Backend', color: 'purple' },
      { id: uuidv4(), name: 'Security', color: 'red' },
    ],
    dueDate: null,
    checklists: [
      {
        id: uuidv4(),
        title: 'Tasks',
        items: [
          { id: uuidv4(), text: 'Create user model', completed: true },
          { id: uuidv4(), text: 'Implement JWT', completed: true },
          { id: uuidv4(), text: 'Add refresh tokens', completed: false },
          { id: uuidv4(), text: 'Write tests', completed: false },
        ],
      },
    ],
    coverColor: '#7c3aed',
    columnId: IN_PROGRESS_COL_ID,
    order: 0,
    createdAt: new Date().toISOString(),
  },
  [CARD4_ID]: {
    id: CARD4_ID,
    title: 'Code review: API endpoints',
    description: 'Review all REST API endpoints for correctness and security.',
    labels: [{ id: uuidv4(), name: 'Review', color: 'yellow' }],
    dueDate: null,
    checklists: [],
    coverColor: null,
    columnId: REVIEW_COL_ID,
    order: 0,
    createdAt: new Date().toISOString(),
  },
  [CARD5_ID]: {
    id: CARD5_ID,
    title: 'Create project repository',
    description: 'Set up GitHub repo with CI/CD workflows.',
    labels: [{ id: uuidv4(), name: 'DevOps', color: 'green' }],
    dueDate: null,
    checklists: [],
    coverColor: null,
    columnId: DONE_COL_ID,
    order: 0,
    createdAt: new Date().toISOString(),
  },
};

interface KanbanActions {
  // Board actions
  createBoard: (title: string, description: string, background: string) => string;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  setActiveBoard: (boardId: string | null) => void;
  toggleBoardStar: (boardId: string) => void;

  // Column actions
  createColumn: (boardId: string, title: string) => string;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (boardId: string, fromIndex: number, toIndex: number) => void;

  // Card actions
  createCard: (columnId: string, title: string) => string;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumnId: string, newIndex: number) => void;

  // Label actions
  addLabelToCard: (cardId: string, label: Label) => void;
  removeLabelFromCard: (cardId: string, labelId: string) => void;

  // Checklist actions
  addChecklist: (cardId: string, title: string) => void;
  deleteChecklist: (cardId: string, checklistId: string) => void;
  addChecklistItem: (cardId: string, checklistId: string, text: string) => void;
  updateChecklistItem: (cardId: string, checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (cardId: string, checklistId: string, itemId: string) => void;
}

type KanbanStore = KanbanState & KanbanActions;

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      boards: initialBoards,
      columns: initialColumns,
      cards: initialCards,
      activeBoardId: DEMO_BOARD_ID,

      // Board actions
      createBoard: (title, description, background) => {
        const id = uuidv4();
        const board: Board = {
          id,
          title,
          description,
          background,
          columnIds: [],
          createdAt: new Date().toISOString(),
          starred: false,
        };
        set((state) => ({
          boards: { ...state.boards, [id]: board },
          activeBoardId: id,
        }));
        return id;
      },

      updateBoard: (boardId, updates) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...state.boards[boardId], ...updates },
          },
        }));
      },

      deleteBoard: (boardId) => {
        const state = get();
        const board = state.boards[boardId];
        if (!board) return;

        const newColumns = { ...state.columns };
        const newCards = { ...state.cards };

        board.columnIds.forEach((colId) => {
          const col = newColumns[colId];
          if (col) {
            col.cardIds.forEach((cardId) => { delete newCards[cardId]; });
            delete newColumns[colId];
          }
        });

        const newBoards = { ...state.boards };
        delete newBoards[boardId];

        const remainingIds = Object.keys(newBoards);
        set({
          boards: newBoards,
          columns: newColumns,
          cards: newCards,
          activeBoardId: remainingIds.length > 0 ? remainingIds[0] : null,
        });
      },

      setActiveBoard: (boardId) => set({ activeBoardId: boardId }),

      toggleBoardStar: (boardId) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              starred: !state.boards[boardId].starred,
            },
          },
        }));
      },

      // Column actions
      createColumn: (boardId, title) => {
        const id = uuidv4();
        const board = get().boards[boardId];
        const column: Column = {
          id,
          title,
          boardId,
          order: board.columnIds.length,
          cardIds: [],
        };
        set((state) => ({
          columns: { ...state.columns, [id]: column },
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              columnIds: [...state.boards[boardId].columnIds, id],
            },
          },
        }));
        return id;
      },

      updateColumn: (columnId, updates) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], ...updates },
          },
        }));
      },

      deleteColumn: (columnId) => {
        const state = get();
        const col = state.columns[columnId];
        if (!col) return;

        const newCards = { ...state.cards };
        col.cardIds.forEach((cardId) => { delete newCards[cardId]; });

        const newColumns = { ...state.columns };
        delete newColumns[columnId];

        const board = state.boards[col.boardId];
        set({
          columns: newColumns,
          cards: newCards,
          boards: {
            ...state.boards,
            [col.boardId]: {
              ...board,
              columnIds: board.columnIds.filter((id) => id !== columnId),
            },
          },
        });
      },

      moveColumn: (boardId, fromIndex, toIndex) => {
        set((state) => {
          const board = state.boards[boardId];
          const newColumnIds = [...board.columnIds];
          const [removed] = newColumnIds.splice(fromIndex, 1);
          newColumnIds.splice(toIndex, 0, removed);
          return {
            boards: {
              ...state.boards,
              [boardId]: { ...board, columnIds: newColumnIds },
            },
          };
        });
      },

      // Card actions
      createCard: (columnId, title) => {
        const id = uuidv4();
        const col = get().columns[columnId];
        const card: Card = {
          id,
          title,
          description: '',
          labels: [],
          dueDate: null,
          checklists: [],
          coverColor: null,
          columnId,
          order: col.cardIds.length,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          cards: { ...state.cards, [id]: card },
          columns: {
            ...state.columns,
            [columnId]: {
              ...state.columns[columnId],
              cardIds: [...state.columns[columnId].cardIds, id],
            },
          },
        }));
        return id;
      },

      updateCard: (cardId, updates) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...state.cards[cardId], ...updates },
          },
        }));
      },

      deleteCard: (cardId) => {
        const state = get();
        const card = state.cards[cardId];
        if (!card) return;

        const newCards = { ...state.cards };
        delete newCards[cardId];

        set({
          cards: newCards,
          columns: {
            ...state.columns,
            [card.columnId]: {
              ...state.columns[card.columnId],
              cardIds: state.columns[card.columnId].cardIds.filter((id) => id !== cardId),
            },
          },
        });
      },

      moveCard: (cardId, toColumnId, newIndex) => {
        const state = get();
        const card = state.cards[cardId];
        if (!card) return;

        const fromColumnId = card.columnId;
        const newColumns = { ...state.columns };

        // Remove from old column
        const fromCol = { ...newColumns[fromColumnId] };
        fromCol.cardIds = fromCol.cardIds.filter((id) => id !== cardId);
        newColumns[fromColumnId] = fromCol;

        // Add to new column
        const toCol = { ...newColumns[toColumnId] };
        const newCardIds = [...toCol.cardIds];
        newCardIds.splice(newIndex, 0, cardId);
        toCol.cardIds = newCardIds;
        newColumns[toColumnId] = toCol;

        set({
          columns: newColumns,
          cards: {
            ...state.cards,
            [cardId]: { ...card, columnId: toColumnId },
          },
        });
      },

      // Label actions
      addLabelToCard: (cardId, label) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              labels: [...state.cards[cardId].labels, label],
            },
          },
        }));
      },

      removeLabelFromCard: (cardId, labelId) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              labels: state.cards[cardId].labels.filter((l) => l.id !== labelId),
            },
          },
        }));
      },

      // Checklist actions
      addChecklist: (cardId, title) => {
        const checklist: Checklist = { id: uuidv4(), title, items: [] };
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              checklists: [...state.cards[cardId].checklists, checklist],
            },
          },
        }));
      },

      deleteChecklist: (cardId, checklistId) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              checklists: state.cards[cardId].checklists.filter((cl) => cl.id !== checklistId),
            },
          },
        }));
      },

      addChecklistItem: (cardId, checklistId, text) => {
        const item: ChecklistItem = { id: uuidv4(), text, completed: false };
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              checklists: state.cards[cardId].checklists.map((cl) =>
                cl.id === checklistId ? { ...cl, items: [...cl.items, item] } : cl
              ),
            },
          },
        }));
      },

      updateChecklistItem: (cardId, checklistId, itemId, updates) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              checklists: state.cards[cardId].checklists.map((cl) =>
                cl.id === checklistId
                  ? {
                      ...cl,
                      items: cl.items.map((item) =>
                        item.id === itemId ? { ...item, ...updates } : item
                      ),
                    }
                  : cl
              ),
            },
          },
        }));
      },

      deleteChecklistItem: (cardId, checklistId, itemId) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              checklists: state.cards[cardId].checklists.map((cl) =>
                cl.id === checklistId
                  ? { ...cl, items: cl.items.filter((item) => item.id !== itemId) }
                  : cl
              ),
            },
          },
        }));
      },
    }),
    {
      name: 'kanbanflow-storage',
    }
  )
);
