export type LabelColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray';

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  dueDate: string | null;
  checklists: Checklist[];
  coverColor: string | null;
  columnId: string;
  order: number;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  description: string;
  background: string;
  columnIds: string[];
  createdAt: string;
  starred: boolean;
}

export interface KanbanState {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  activeBoardId: string | null;
}
