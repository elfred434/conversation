/** Met en forme une regle : une idee par ligne, ponctuation conservee.
 *  "Général : -s. Après s, x, ch, sh : -es." -> ["Général : -s.", "Après s, x, ch, sh : -es."] */
export function ruleLines(rule: string): string[] {
  return rule
    .replace(/\s+/g, ' ')
    .split(/(?<=\.)\s+/) // apres un point : le point reste attache a sa ligne
    .flatMap((seg) => seg.split(/(?<=;)\s+/)) // apres un point-virgule : il reste a sa ligne
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s, i, arr) => (i === arr.length - 1 && !/[.!?]$/.test(s) ? `${s}.` : s))
}
