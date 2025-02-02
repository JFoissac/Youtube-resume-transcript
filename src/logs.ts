type LogEntry = {
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
  details?: string;
};

function addLogToPage(log: LogEntry) {
  const logsContainer = document.getElementById('logs');
  if (!logsContainer) return;

  const logElement = document.createElement('div');
  logElement.className = `log-entry ${log.type}`;

  const content = `
    <div class="timestamp">${log.timestamp}</div>
    <div class="message">${log.message}</div>
    ${log.details ? `<pre class="transcription">${log.details}</pre>` : ''}
  `;

  logElement.innerHTML = content;
  logsContainer.insertBefore(logElement, logsContainer.firstChild);
}

// Écoute les nouveaux logs
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'NEW_LOG') {
    addLogToPage(message.log);
  }
});

// Charge les logs existants au démarrage
chrome.runtime.sendMessage({ action: 'GET_LOGS' }, (logs: LogEntry[]) => {
  logs.forEach(addLogToPage);
});