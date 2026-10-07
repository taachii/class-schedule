// Mapowanie hierarchii grup:
//   GS n  → GC 2n-1, GC 2n
//   GC m  → GK 2m-1, GK 2m      (od III roku)
//   ⇒ GS n → GK 4n-3 … GK 4n

export const gcOfGs = (n) => [2 * n - 1, 2 * n];
export const gkOfGc = (m) => [2 * m - 1, 2 * m];
export const gkOfGs = (n) => gcOfGs(n).flatMap(gkOfGc);
export const gsOfGc = (m) => Math.ceil(m / 2);
export const gcOfGk = (k) => Math.ceil(k / 2);
export const gsOfGk = (k) => gsOfGc(gcOfGk(k));

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const toRoman = (n) => ROMAN[n] ?? String(n);

/** Pełna lista grup dla danego roku. */
export function allGroups(gsCount, year, clinicalFromYear = 3) {
  const gs = [];
  for (let n = 1; n <= gsCount; n++) {
    gs.push({
      gs: n,
      gc: gcOfGs(n).map((m) => ({
        gc: m,
        gk: year >= clinicalFromYear ? gkOfGc(m) : [],
      })),
    });
  }
  return gs;
}
