import { YoutubeTranscript } from "youtube-transcript";
import { CONFIG } from "../config/settings";
import { handleError, showNotification } from "./errorHandler";
import { log } from "./logger";

export async function getTranscription(videoId: string): Promise<string> {
  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: CONFIG.TRANSCRIPTION.defaultLanguage,
    }).catch(() => {
      log("⚠️ Tentative de récupération de la transcription dans une autre langue.", "warning");
      return YoutubeTranscript.fetchTranscript(videoId);
    });

    if (!transcriptData || transcriptData.length === 0) {
      log("❌ Aucune transcription disponible pour l'ID vidéo : " + videoId, "error");
      throw new Error(CONFIG.ERRORS.NO_TRANSCRIPT);
    }

    log("✅ Transcription récupérée avec succès pour l'ID vidéo : " + videoId, "success");
    return transcriptData
      .map((part) => part.text)
      .join(" ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  } catch (error: any) {
    log(`❌ Erreur lors de la récupération de la transcription : ${error.message}`, "error");
    throw error;
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showNotification("✓ Transcription copiée ! Ouverture de l'IA...");
  } catch (error) {
    throw new Error(CONFIG.ERRORS.COPY_FAILED);
  }
}

export function getVideoId(url: string): string {
  const videoId = new URL(url).searchParams.get("v");
  if (!videoId) {
    throw new Error(CONFIG.ERRORS.NO_VIDEO_ID);
  }
  return videoId;
}

export async function sendToAI(text: string, aiUrl: string): Promise<void> {
  log(`Envoi vers ${aiUrl}`, "info");
  const aiTab = window.open(aiUrl, "_blank");

  if (aiTab) {
    if (aiUrl.includes("claude.ai")) {
      log("Attente du chargement de Claude...", "info");
      await new Promise((resolve) => setTimeout(resolve, 3500));
      aiTab.postMessage(
        {
          action: "PASTE_TO_CLAUDE",
          text: text,
        },
        "*"
      );
      log("Texte envoyé à Claude", "success");
    }
  } else {
    log("Impossible d'ouvrir l'onglet IA", "error");
  }
}
