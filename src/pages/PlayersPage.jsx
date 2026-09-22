import { useEffect, useState } from 'react'
import { apiGet } from '../api/client'

const formatNumber = (v) => (v == null ? '' : Number(v).toLocaleString())

const formatDate = (v) => {
  if (v == null) return ''
  const d = new Date(v)
  return isNaN(d) ? String(v) : d.toISOString().slice(0, 10)
}

// label = header text, key = exact column name in the API response
const columns = [
  { label: 'Short name', key: 'short_name' },
  { label: 'Name', key: 'long_name' },
  { label: 'Positions', key: 'player_positions' },
  { label: 'Overall', key: 'overall' },
  { label: 'Potential', key: 'potential' },
  { label: 'Value (EUR)', key: 'value_eur', format: formatNumber },
  { label: 'Wage (EUR)', key: 'wage_eur', format: formatNumber },
  { label: 'Age', key: 'age' },
  { label: 'Date of Birth', key: 'dob', format: formatDate },
  { label: 'Height (cm)', key: 'height_cm' },
  { label: 'Weight (kg)', key: 'weight_kg' },
  { label: 'Club Name', key: 'club_name' },
  { label: 'Club Position', key: 'club_position' },
  { label: 'Nationality', key: 'nationality_name' },
  { label: 'Preferred Foot', key: 'preferred_foot' },
  { label: 'Weak Foot', key: 'weak_foot' },
  { label: 'Skills', key: 'skill_moves' },
  { label: 'Reputation', key: 'international_reputation' },
  { label: 'Pace', key: 'pace' },
  { label: 'Shooting', key: 'shooting' },
  { label: 'Passing', key: 'passing' },
  { label: 'Dribbling', key: 'dribbling' },
  { label: 'Defending', key: 'defending' },
  { label: 'Physic', key: 'physic' },
  { label: 'Att. Crossing', key: 'attacking_crossing' },
  { label: 'Att. Finishing', key: 'attacking_finishing' },
  { label: 'Att. Header', key: 'attacking_heading_accuracy' },
  { label: 'Att. Short Pass', key: 'attacking_short_passing' },
  { label: 'Att. Volley', key: 'attacking_volleys' },
  { label: 'Skill Dribbling', key: 'skill_dribbling' },
  { label: 'Skill Curve', key: 'skill_curve' },
  { label: 'Skill FK Accuracy', key: 'skill_fk_accuracy' },
  { label: 'Skill Long Pass', key: 'skill_long_passing' },
  { label: 'Skill Control', key: 'skill_ball_control' },
  { label: 'Move Acceleration', key: 'movement_acceleration' },
  { label: 'Move Sprint Speed', key: 'movement_sprint_speed' },
  { label: 'Move Agility', key: 'movement_agility' },
  { label: 'Move Reaction', key: 'movement_reactions' },
  { label: 'Move Balance', key: 'movement_balance' },
  { label: 'Power Shooting', key: 'power_shot_power' },
  { label: 'Power Jumping', key: 'power_jumping' },
  { label: 'Power Stamina', key: 'power_stamina' },
  { label: 'Power Strength', key: 'power_strength' },
  { label: 'Power Long Shot', key: 'power_long_shots' },
  { label: 'Mental Aggression', key: 'mentality_aggression' },
  { label: 'Mental Intercept', key: 'mentality_interceptions' },
  { label: 'Mental Positioning', key: 'mentality_positioning' },
  { label: 'Mental Vision', key: 'mentality_vision' },
  { label: 'Mental Penalty', key: 'mentality_penalties' },
  { label: 'Mental Composure', key: 'mentality_composure' },
  { label: 'Defend Marking', key: 'defending_marking_awareness' },
  { label: 'Defend Standing', key: 'defending_standing_tackle' },
  { label: 'Defend Sliding', key: 'defending_sliding_tackle' },
  { label: 'GK Diving', key: 'goalkeeping_diving' },
  { label: 'GK Handling', key: 'goalkeeping_handling' },
  { label: 'GK Kicking', key: 'goalkeeping_kicking' },
  { label: 'GK Positioning', key: 'goalkeeping_positioning' },
  { label: 'GK Reflex', key: 'goalkeeping_reflexes' },
]

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiGet('/items')
      .then((data) => setPlayers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = players.filter((p) =>
    p.long_name?.toLowerCase().includes(search.toLowerCase())
  )

  // temporary check: columns whose key doesn't exist in the API data
  const missing = players.length
    ? columns.filter((c) => !(c.key in players[0]))
    : []

  return (
    <>
      <h1>Players</h1>
      <input
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Could not load players: {error}</p>}
      {missing.length > 0 && (
        <p style={{ color: 'crimson' }}>
          Unknown column keys: {missing.map((c) => c.key).join(', ')}
        </p>
      )}

      {!loading && !error && (
        <>
          <p>{filtered.length} players (showing first 100)</p>
          <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((p) => (
                  <tr key={p.player_id}>
                    {columns.map((c) => (
                      <td key={c.key}>
                        {c.format ? c.format(p[c.key]) : p[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}