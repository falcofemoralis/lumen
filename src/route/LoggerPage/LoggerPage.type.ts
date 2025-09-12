import { LogEntry } from 'Store/Logger.store';

export interface LoggerPageProps {
  data: LogEntry[];
  isSending: boolean;
  sendLogs: () => Promise<void>;
  clearLogs: () => void;
}