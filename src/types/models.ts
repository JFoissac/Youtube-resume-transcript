export interface AIModel {
  name: string;
  url: string;
  color: string;
  icon: string;
}

export interface LogEntry {
  message: string;
  type: LogType;
  timestamp: string;
  details?: string;
}

export interface TranscriptionResult {
  success: boolean;
  length?: number;
  error?: string;
}