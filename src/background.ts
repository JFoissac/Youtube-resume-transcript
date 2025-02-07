let logs: any[] = [];
const MAX_LOGS = 100;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SEND_TO_AI") {
    const { text, url } = message.data;

    // Gestion spécifique selon le type d'IA
    if (url.includes("chat.openai.com")) {
      handleChatGPT(text, url);
    } else if (url.includes("claude.ai")) {
      handleClaude(text, url);
    }
  } else if (message.action === "NEW_LOG") {
    logs.unshift(message.log);
    if (logs.length > MAX_LOGS) logs.pop();
  } else if (message.action === "GET_LOGS") {
    sendResponse(logs);
  }
  return true;
});

async function handleChatGPT(text: string, url: string) {
  const tab = await chrome.tabs.create({ url });
  if (!tab.id) return;

  // Attend que la page soit chargée
  await new Promise((resolve) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 2000); // Attente supplémentaire pour le chargement complet
      }
    });
  });

  // Utilise clipboard API au lieu d'une injection directe
  await navigator.clipboard.writeText(text);

  // Notifie l'utilisateur
  chrome.tabs.sendMessage(tab.id, {
    action: "SHOW_NOTIFICATION",
    message: "Texte copié ! Utilisez Ctrl+V pour coller.",
  });
}

async function handleClaude(text: string, url: string) {
  // Logique similaire pour Claude...
}
