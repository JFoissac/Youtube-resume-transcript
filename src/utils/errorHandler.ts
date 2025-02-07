/**
 * Gère les différents types d'erreurs et retourne un message utilisateur approprié
 * @param error - L'erreur à traiter
 * @returns Un message d'erreur formaté pour l'utilisateur
 */
export function handleError(error: unknown): string {
  console.error("Erreur détaillée:", error);

  if (error instanceof DOMException) {
    return `Erreur d'accès : ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue";
}

/**
 * Affiche une notification temporaire à l'utilisateur
 * @param message - Le message à afficher
 * @param duration - La durée d'affichage en millisecondes
 */
export function showNotification(message: string, duration = 3000): void {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = "1";
  });

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
}