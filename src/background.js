let logs = []; // Tableau pour stocker les logs
let copiedText = ""; // Variable pour stocker le texte copié

// Exemple de fonction pour ajouter un log
function logMessage(message) {
  logs.push(message);
  console.log(message); // Affiche dans la console pour le débogage
}

// Écoute des messages pour récupérer les logs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logMessage("🎯 Message reçu dans le background script: " + JSON.stringify(message));
  if (message.request === "getLogs") {
    sendResponse({ logs, copiedText }); // Envoie les logs et le texte copié
  }
});

// Exemple d'utilisation
logMessage("L'extension a démarré.");

// Modifiez la fonction copyToClipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    copiedText = text; // Met à jour le texte copié
    logMessage("✓ Transcription copiée : " + text);
  } catch (error) {
    logMessage("❌ Erreur lors de la copie : " + error.message);
    throw new Error(CONFIG.ERRORS.COPY_FAILED);
  }
}
