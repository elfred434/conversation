import { ruleLines } from '../lib/ruleLines'

/** Une regle affichee ligne par ligne (une idee = une ligne). */
export default function RuleText({ rule }: { rule: string }): JSX.Element {
  return (
    <ul className="rule-lines">
      {ruleLines(rule).map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  )
}
