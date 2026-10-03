/**
 * Wspólna logika uprawnień moderatorów (starostów GS).
 * Używana zarówno po stronie serwera (server actions), jak i w UI.
 *
 * Moderator przypisany do GS n zarządza:
 *  - GS n
 *  - GC 2n-1, GC 2n
 *  - GK 4n-3 … GK 4n
 */

/** Typy zajęć zarezerwowane dla starosty roku / mastera. */
export const RESTRICTED_EVENT_TYPES = ['E', 'W'];

export function getModeratorAllowedGroups(gsGroup: string | null | undefined): Set<string> {
  const allowed = new Set<string>();
  if (!gsGroup) return allowed;

  const n = parseInt(gsGroup.replace(/[^0-9]/g, ''));
  if (isNaN(n)) return allowed;

  allowed.add(`GS${n}`);
  allowed.add(`GC${n * 2 - 1}`);
  allowed.add(`GC${n * 2}`);
  for (let i = 3; i >= 0; i--) {
    allowed.add(`GK${n * 4 - i}`);
  }
  return allowed;
}

/**
 * Czy moderator może modyfikować zajęcia o podanych grupach docelowych?
 * Wymagamy, aby WSZYSTKIE grupy należały do moderatora (i aby była co najmniej jedna) –
 * dzięki temu nie zmodyfikuje zajęć współdzielonych z inną grupą seminaryjną.
 */
export function moderatorCanTouchGroups(gsGroup: string | null | undefined, targetGroups: string[] | null | undefined): boolean {
  if (!targetGroups || targetGroups.length === 0) return false;
  const allowed = getModeratorAllowedGroups(gsGroup);
  return targetGroups.every(g => allowed.has(g));
}
