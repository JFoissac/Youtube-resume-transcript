import { useState } from 'react';
import { FileText, Send } from 'lucide-react';

function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setError(null);
    try {
      // Envoyer un message au content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        throw new Error("Aucun onglet YouTube actif trouvé");
      }
      if (!tab.url?.includes("youtube.com/watch")) {
        throw new Error("Veuillez ouvrir une vidéo YouTube");
      }
      await chrome.tabs.sendMessage(tab.id, { action: "transcribe" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
      console.error("Erreur lors de la transcription:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="w-80 p-4 bg-white">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        YouTube Transcription
      </h1>

      <button
        onClick={handleTranscribe}
        disabled={isTranscribing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {isTranscribing ? "Transcription en cours..." : "Transcrire et résumer"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">Cette extension va :</p>
        <ol className="list-decimal ml-5">
          <li>Extraire la transcription de la vidéo YouTube</li>
          <li>Ouvrir ChatGPT dans un nouvel onglet</li>
          <li>Préparer un résumé de la vidéo</li>
        </ol>
      </div>
    </div>
  );
}

export default App;