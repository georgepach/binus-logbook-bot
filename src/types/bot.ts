export interface ActivityData {
  date: string; // YYYY-MM-DD
  activity: string;
  description: string;
}

export interface ExcelData {
  [key: string]: ActivityData;
}

export interface BotConfig {
  clockInTime: string;
  clockOutTime: string;
  excelFilePath: string;
  logbookMonth: string;
  logbookMonthNumber: number;
  internshipSemester: string;
  dryRun: boolean;
  onlyDates: string[];
}

export interface BotState {
  currentRow: number;
  totalRows: number;
  processedDates: string[];
  skippedDates: string[];
  errors: string[];
}

// Logbook entry as returned by the LMS logbook list ("data": [...])
export interface LogBookEntry {
  id: string | null;
  logBookHeaderID: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  activity: string | null;
  description: string | null;
  acceptanceID: number | null;
  acceptance: string | null;
  flagjulyactive: boolean;
}

// Payload sent to LogBook/StudentSave
export interface LogBookSavePayload {
  id: string;
  logBookHeaderID: string;
  date: string; // YYYY-MM-DDT00:00:00
  activity: string;
  clockIn: string;
  clockOut: string;
  description: string;
  flagjulyactive: boolean;
}
