import { YoutubeTranscript } from "youtube-transcript";
import { CONFIG } from "../config/settings";
import { ErrorHandler } from "./errorHandler";
import { Logger } from "./logger";

export class TranscriptionManager {
  static async getTranscription(videoId: string): Promise<string> {
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: CONFIG.TRANSCRIPTION.defaultLanguage,
      }).catch(() => {
        Logger.log("⚠️ Tentative de récupération de la transcription dans une autre langue.", "warning");
        return YoutubeTranscript.fetchTranscript(videoId);
      });

      if (!transcriptData || transcriptData.length === 0) {
        Logger.log("❌ Aucune transcription disponible pour l'ID vidéo : " + videoId, "error");
        throw new Error(CONFIG.ERRORS.NO_TRANSCRIPT);
      }

      Logger.log("✅ Transcription récupérée avec succès pour l'ID vidéo : " + videoId, "success");
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
      Logger.log("❌ Erreur lors de la récupération de la transcription : " + error.message, "error");
      throw new Error(ErrorHandler.handle(error));
    }
  }

  static async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      ErrorHandler.showNotification("✓ Transcription copiée ! Ouverture de l'IA...");
    } catch (error) {
      throw new Error(CONFIG.ERRORS.COPY_FAILED);
    }
  }

  static getVideoId(url: string): string {
    const videoId = new URL(url).searchParams.get("v");
    if (!videoId) {
      throw new Error(CONFIG.ERRORS.NO_VIDEO_ID);
    }
    return videoId;
  }

  static async sendToAI(text: string, aiUrl: string): Promise<void> {
    Logger.log(`Envoi vers ${aiUrl}`, "info");
    const aiTab = window.open(aiUrl, "_blank");

    if (aiTab) {
      if (aiUrl.includes("claude.ai")) {
        Logger.log("Attente du chargement de Claude...", "info");
        await new Promise((resolve) => setTimeout(resolve, 3500));
        aiTab.postMessage(
          {
            action: "PASTE_TO_CLAUDE",
            text: text,
          },
          "*"
        );
        Logger.log("Texte envoyé à Claude", "success");
      }
    } else {
      Logger.log("Impossible d'ouvrir l'onglet IA", "error");
    }
  }
}
