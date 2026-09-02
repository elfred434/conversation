/** Etiquette de date douce : "Aujourd'hui, 14:30", "Hier, 09:15", sinon date courte. */
export function dayLabel(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = (a: Date, b: Date): boolean => a.toDateString() === b.toDateString()
  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)
  const hm = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (sameDay(d, now)) return `Aujourd'hui, ${hm}`
  if (sameDay(d, yest)) return `Hier, ${hm}`
  const day = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${day}, ${hm}`
}
