/**
 * Vérifie si l'URL courante correspond à une page de lecture vidéo YouTube
 * @returns boolean indiquant si on est sur une page de lecture
 */
export function isVideoWatch(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname === '/watch' && urlObj.searchParams.has('v');
  } catch {
    return false;
  }
}