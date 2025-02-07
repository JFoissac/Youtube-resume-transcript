// Script injecté dans la page Claude
function injectToClaude(text: string) {
  const targetElement = document.querySelector('div[contenteditable="true"][enterkeyhint="enter"]');

  if (targetElement) {
    // Efface et insère le nouveau texte
    targetElement.textContent = '';
    targetElement.textContent = text;

    // Simule l'appui sur Entrée
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    });

    targetElement.dispatchEvent(enterEvent);
  } else {
    console.error("Zone de texte Claude non trouvée");
  }
}

// Écoute les messages du content script
window.addEventListener("message", (event) => {
  if (event.data.action === "PASTE_TO_CLAUDE") {
    injectToClaude(event.data.text);
  }
});