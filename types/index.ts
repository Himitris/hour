export type WorkEntry = {
  date: string; // ISO format 'YYYY-MM-DD'
  hours: number;
  note?: string;
};

export type WorkEntries = Record<string, WorkEntry>;

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