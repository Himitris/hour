export type WorkEntry = {
  date: string; // ISO format 'YYYY-MM-DD'
  hours: number;
  note?: string;
  isBilled: boolean;
};

export type WorkEntries = Record<string, WorkEntry>;

export type Payment = {
  id: string; // Identifiant unique pour permettre la suppression
  date: string; // ISO format 'YYYY-MM-DD'
  amount: number;
  note?: string;
};

export type CalendarMarking = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    customStyles?: {
      container?: {
        backgroundColor?: string;
      };
      text?: {
        color?: string;
      };
    };
  };
};
