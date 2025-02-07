// Écoute les messages pour afficher les notifications
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "SHOW_NOTIFICATION") {
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
    `;
    notification.textContent = message.message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
});