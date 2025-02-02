import { CONFIG } from "./config/settings";
import { ErrorHandler } from "./utils/errorHandler";
import { TranscriptionManager } from "./utils/transcriptionManager";

// Fonction principale qui injecte le bouton dans l'interface YouTube
function injectButton() {
  // Recherche le conteneur des boutons like/dislike
  const likeContainer = document.querySelector(CONFIG.SELECTORS.LIKE_CONTAINER);

  // Vérifie si le conteneur existe et si notre bouton n'est pas déjà injecté
  if (likeContainer && !document.querySelector(`#${CONFIG.SELECTORS.AI_BUTTON_ID}`)) {
    // Crée un conteneur pour notre bouton
    const container = document.createElement("div");
    container.id = CONFIG.SELECTORS.AI_BUTTON_ID;
    // Applique les styles de base
    container.style.cssText = `
      position: relative;
      display: inline-block;
      margin-left: 8px;
    `;

    // Crée et ajoute le bouton principal
    const mainButton = createMainButton();
    container.appendChild(mainButton);
    likeContainer.appendChild(container);
  }
}

// Crée le bouton principal avec les styles et les icônes
function createMainButton() {
  const mainButton = document.createElement("button");
  // Utilise la classe de style YouTube pour la cohérence visuelle
  mainButton.className = "yt-spec-button-shape-next";
  // Applique les styles personnalisés depuis la configuration
  mainButton.style.cssText = `
    display: flex;
    align-items: center;
    padding: ${CONFIG.STYLES.BUTTON.padding};
    height: ${CONFIG.STYLES.BUTTON.height};
    border: none;
    background: ${CONFIG.STYLES.BUTTON.background};
    color: white;
    border-radius: ${CONFIG.STYLES.BUTTON.borderRadius};
    cursor: pointer;
  `;

  // Ajoute les icônes des modèles d'IA
  mainButton.innerHTML = createAIModelIcons();
  // Configure les événements pour chaque icône
  addIconEventListeners(mainButton);

  return mainButton;
}

// Génère le HTML pour les icônes des différents modèles d'IA
function createAIModelIcons(): string {
  return `
    <div style="display: flex; align-items: center; gap: 8px;">
      ${Object.values(CONFIG.AI_MODELS)
        .map(
          (model) => `
        <div style="display: flex; align-items: center; opacity: 0.8; transition: opacity 0.2s;"
             title="Résumer avec ${model.name}"
             data-url="${model.url}">
          ${model.icon}
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// Configure les événements pour chaque icône (survol et clic)
function addIconEventListeners(button: HTMLElement) {
  button.querySelectorAll("[data-url]").forEach((icon) => {
    const iconElement = icon as HTMLElement;
    // Effet de survol
    iconElement.addEventListener("mouseover", () => {
      iconElement.style.opacity = "1";
    });
    iconElement.addEventListener("mouseout", () => {
      iconElement.style.opacity = "0.8";
    });
    // Gestion du clic pour lancer la transcription
    iconElement.addEventListener("click", async (e) => {
      e.stopPropagation();
      const url = icon.getAttribute("data-url");
      if (url) {
        try {
          await handleTranscription(url);
        } catch (error) {
          ErrorHandler.showNotification(ErrorHandler.handle(error));
        }
      }
    });
  });
}

// Gère le processus de transcription et d'envoi vers l'IA
async function handleTranscription(aiUrl: string) {
  // Récupère l'ID de la vidéo depuis l'URL
  const videoId = TranscriptionManager.getVideoId(window.location.href);
  const transcriptionText = await TranscriptionManager.getTranscription(videoId);
  const fullText = CONFIG.TRANSCRIPTION.prompt + transcriptionText;

  // Copie le texte dans le presse-papiers
  await TranscriptionManager.copyToClipboard(fullText);

  // Ouvre l'IA dans un nouvel onglet et envoie le message via le background script
  const newTab = window.open(aiUrl, "_blank");
  if (newTab) {
    chrome.runtime.sendMessage({
      action: "SEND_TO_AI",
      data: {
        text: fullText,
        url: aiUrl,
      },
    });
  }

  return { success: true, length: transcriptionText.length };
}

// Configure l'observateur pour injecter le bouton quand la page change
const observer = new MutationObserver(injectButton);
observer.observe(document.body, { childList: true, subtree: true });
// Injection initiale du bouton
injectButton();

// Écoute les messages du popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "transcribe") {
    Promise.resolve()
      .then(() => handleTranscription(CONFIG.AI_MODELS.CHATGPT.url))
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ error: ErrorHandler.handle(error) }));
    return true; // Indique que la réponse sera envoyée de manière asynchrone
  }
});
