interface LogEntry {
  message: string;
  type: LogType;
  timestamp: string;
  details?: string;
}

export type LogType = 'success' | 'error' | 'info' | 'warning';

const logStore = {
  entries: [] as LogEntry[],
  maxEntries: 100
};

export function log(message: string, type: LogType = 'info', details?: string) {
  const entry = {
    message,
    type,
    timestamp: new Date().toLocaleTimeString(),
    details
  };

  logStore.entries.unshift(entry);
  if (logStore.entries.length > logStore.maxEntries) {
    logStore.entries.pop();
  }

  // Envoie le log à la page de logs si elle est ouverte
  chrome.runtime.sendMessage({
    action: 'NEW_LOG',
    log: entry
  });

  console.log(`[${entry.type.toUpperCase()}] ${entry.message}`, details || '');
}

export function getLogs() {
  return logStore.entries;
}