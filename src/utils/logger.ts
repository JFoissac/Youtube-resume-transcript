export type LogType = 'success' | 'error' | 'info' | 'warning';
type LogEntry = {
  message: string;
  type: LogType;
  timestamp: string;
  details?: string;
};

export class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 100;

  static log(message: string, type: LogType = 'info', details?: string) {
    const entry = {
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
      details
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Envoie le log à la page de logs si elle est ouverte
    chrome.runtime.sendMessage({
      action: 'NEW_LOG',
      log: entry
    });

    console.log(`[${entry.type.toUpperCase()}] ${entry.message}`, details || '');
  }

  static getLogs() {
    return this.logs;
  }
}