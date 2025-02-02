let logs: any[] = [];
const MAX_LOGS = 100;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SEND_TO_AI") {
    // Attendre que l'onglet soit chargé
    setTimeout(() => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "PASTE_TO_CLAUDE",
            text: message.data.text
          });
        }
      });
    }, 3500);
  }
  else if (message.action === 'NEW_LOG') {
    logs.unshift(message.log);
    if (logs.length > MAX_LOGS) logs.pop();
  }
  else if (message.action === 'GET_LOGS') {
    sendResponse(logs);
  }
  return true;
});