import { useEffect, useState } from 'react'
import { useTeams } from '../context/TeamsContext'
import { ATTRIBUTES, computeTeamStats, formatDecimal, formatMoney } from '../utils/teamStats'

const SUMMARY_METRICS = [
  { key: 'count', label: 'Players', higherIsBetter: null, format: (v) => v },
  { key: 'avgOverall', label: 'Avg overall', higherIsBetter: true, format: formatDecimal },
  { key: 'avgPotential', label: 'Avg potential', higherIsBetter: true, format: formatDecimal },
  { key: 'avgAge', label: 'Avg age', higherIsBetter: false, format: formatDecimal },
  { key: 'totalValue', label: 'Total value', higherIsBetter: true, format: formatMoney },
  { key: 'totalWage', label: 'Total wage', higherIsBetter: false, format: formatMoney },
]

export default function ComparePage() {
  const { teams, loading, error, getTeamPlayers } = useTeams()

  const [teamAId, setTeamAId] = useState(null)
  const [teamBId, setTeamBId] = useState(null)

  // default to the first two teams once they load
  useEffect(() => {
    if (teams.length === 0) return
    setTeamAId((cur) => cur ?? teams[0]?.id ?? null)
    setTeamBId((cur) => cur ?? teams[1]?.id ?? teams[0]?.id ?? null)
  }, [teams])

  if (loading) return <p>Loading players...</p>
  if (error) return <p style={{ color: 'crimson' }}>Could not load players: {error}</p>
  if (teams.length === 0) return <p>Create at least one team to use the comparison page.</p>

  const teamA = teams.find((t) => t.id === teamAId) ?? null
  const teamB = teams.find((t) => t.id === teamBId) ?? null

  const statsA = teamA ? computeTeamStats(getTeamPlayers(teamA)) : null
  const statsB = teamB ? computeTeamStats(getTeamPlayers(teamB)) : null

  const allLines = Array.from(
    new Set([
      ...Object.keys(statsA?.lines ?? {}),
      ...Object.keys(statsB?.lines ?? {}),
    ])
  )

  function winnerSide(aVal, bVal, higherIsBetter) {
    if (higherIsBetter === null || aVal === bVal) return null
    if (higherIsBetter) return aVal > bVal ? 'a' : 'b'
    return aVal < bVal ? 'a' : 'b'
  }

  return (
    <>
      <h1>Compare teams</h1>

      <div className="compare-selectors">
        <select value={teamAId ?? ''} onChange={(e) => setTeamAId(e.target.value)}>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <span>vs</span>
        <select value={teamBId ?? ''} onChange={(e) => setTeamBId(e.target.value)}>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {teamAId === teamBId && (
        <p style={{ color: '#888' }}>Pick two different teams for a meaningful comparison.</p>
      )}

      {statsA && statsB && (
        <>
          <h2>Summary</h2>
          <table className="compare-table">
            <thead>
              <tr>
                <th>{teamA.name}</th>
                <th></th>
                <th>{teamB.name}</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY_METRICS.map(({ key, label, higherIsBetter, format }) => {
                const aVal = statsA[key]
                const bVal = statsB[key]
                const win = winnerSide(aVal, bVal, higherIsBetter)
                return (
                  <tr key={key}>
                    <td className={win === 'a' ? 'compare-win' : undefined}>{format(aVal)}</td>
                    <td className="compare-metric-label">{label}</td>
                    <td className={win === 'b' ? 'compare-win' : undefined}>{format(bVal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <h2>Average attributes</h2>
          {ATTRIBUTES.map(({ key, label }) => {
            const aVal = statsA.attributes[key] ?? 0
            const bVal = statsB.attributes[key] ?? 0
            return (
              <div className="compare-attr-row" key={key}>
                <div className="compare-bar-track compare-bar-left">
                  <div className="compare-bar-fill left" style={{ width: `${aVal}%` }} />
                </div>
                <div className="compare-attr-center">
                  <span>{formatDecimal(aVal)}</span>
                  <span className="compare-attr-label">{label}</span>
                  <span>{formatDecimal(bVal)}</span>
                </div>
                <div className="compare-bar-track compare-bar-right">
                  <div className="compare-bar-fill right" style={{ width: `${bVal}%` }} />
                </div>
              </div>
            )
          })}

          <h2>Squad by line</h2>
          <table className="compare-table">
            <thead>
              <tr>
                <th>{teamA.name}</th>
                <th></th>
                <th>{teamB.name}</th>
              </tr>
            </thead>
            <tbody>
              {allLines.map((line) => {
                const aVal = statsA.lines[line] ?? 0
                const bVal = statsB.lines[line] ?? 0
                const win = winnerSide(aVal, bVal, true)
                return (
                  <tr key={line}>
                    <td className={win === 'a' ? 'compare-win' : undefined}>{aVal}</td>
                    <td className="compare-metric-label">{line}</td>
                    <td className={win === 'b' ? 'compare-win' : undefined}>{bVal}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}