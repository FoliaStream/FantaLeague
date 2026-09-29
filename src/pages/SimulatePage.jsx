import { useEffect, useState } from 'react'
import { useTeams } from '../context/TeamsContext'
import { apiGet, apiPost } from '../api/client'

const SEASONS = ['2026-27']

const card = {
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  padding: '1rem',
  marginBottom: '1rem',
  background: '#fff',
}
const th = {
  textAlign: 'left',
  borderBottom: '1px solid #eee',
  padding: '0.35rem 0.5rem',
  fontSize: '0.85rem',
  color: '#666',
}
const td = {
  padding: '0.4rem 0.5rem',
  borderBottom: '1px solid #f4f4f4',
  verticalAlign: 'top',
}

export default function SimulatePage() {
  const { teams, loading: teamsLoading, error: teamsError } = useTeams()

  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [season, setSeason] = useState('2026-27')
  const [giornata, setGiornata] = useState(1)
  const [sims, setSims] = useState(1000)
  const [seed, setSeed] = useState('')

  const [lineupData, setLineupData] = useState(null)   // {clubs: {...}}
  const [overrides, setOverrides] = useState({})       // {club: [player_ids]}
  const [showLineups, setShowLineups] = useState(false)

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)

  // pick defaults once teams load
  useEffect(() => {
    if (teams.length >= 2) {
      setTeamA((cur) => cur || teams[0].name)
      setTeamB((cur) => cur || teams[1].name)
    } else if (teams.length === 1) {
      setTeamA((cur) => cur || teams[0].name)
      setTeamB((cur) => cur || teams[0].name)
    }
  }, [teams])

  // fetch pre-compiled lineups whenever season/giornata change
  useEffect(() => {
    let cancelled = false
    apiGet(`/lineups?season=${encodeURIComponent(season)}&giornata=${giornata}`)
      .then((data) => { if (!cancelled) { setLineupData(data); setOverrides({}) } })
      .catch(() => { if (!cancelled) setLineupData(null) })
    return () => { cancelled = true }
  }, [season, giornata])

  function setClubLineup(club, ids) {
    setOverrides((cur) => ({ ...cur, [club]: ids }))
  }
  function resetClubLineup(club) {
    setOverrides((cur) => {
      const next = { ...cur }
      delete next[club]
      return next
    })
  }

  async function run() {
    setRunning(true)
    setError(null)
    try {
      const body = {
        team_a: teamA,
        team_b: teamB,
        season,
        giornata: Number(giornata),
        sims: Number(sims),
      }
      if (seed !== '') body.seed = Number(seed)
      if (Object.keys(overrides).length > 0) body.lineups = overrides
      const data = await apiPost('/simulate', body)
      setResult(data)
    } catch (e) {
      setError(e.message)
      setResult(null)
    } finally {
      setRunning(false)
    }
  }

  const canRun = !running && teamA && teamB && teamA !== teamB
  const editedCount = Object.keys(overrides).length

  return (
    <>
      <h1>Simulate a matchday</h1>

      {teamsLoading && <p>Loading teams...</p>}
      {teamsError && <p style={{ color: 'crimson' }}>Could not load teams: {teamsError}</p>}
      {!teamsLoading && teams.length < 2 && (
        <p>Create at least two teams in <em>Team builder</em> before simulating.</p>
      )}

      {teams.length >= 2 && (
        <div style={card}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Team A">
              <select value={teamA} onChange={(e) => setTeamA(e.target.value)}>
                {teams.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Team B">
              <select value={teamB} onChange={(e) => setTeamB(e.target.value)}>
                {teams.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Season">
              <select value={season} onChange={(e) => setSeason(e.target.value)}>
                {SEASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Giornata">
              <input
                type="number" min={1} max={38}
                value={giornata}
                onChange={(e) => setGiornata(e.target.value)}
                style={{ width: 70 }}
              />
            </Field>
            <Field label="Simulations">
              <input
                type="number" min={1} max={10000} step={100}
                value={sims}
                onChange={(e) => setSims(e.target.value)}
                style={{ width: 90 }}
              />
            </Field>
            <Field label="Seed (optional)">
              <input
                type="number" placeholder="random"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                style={{ width: 90 }}
              />
            </Field>
            <button
              onClick={run}
              disabled={!canRun}
              style={{
                padding: '0.5rem 1.25rem',
                fontWeight: 600,
                background: canRun ? '#111' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: canRun ? 'pointer' : 'not-allowed',
              }}
            >
              {running ? 'Simulating...' : 'Run simulation'}
            </button>
          </div>
          {teamA === teamB && (
            <p style={{ color: '#888', marginTop: '0.5rem' }}>
              Pick two different teams.
            </p>
          )}
        </div>
      )}

      {/* Lineups editor */}
      {lineupData && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              Real lineups
              {editedCount > 0 && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#a06600', fontWeight: 400 }}>
                  ({editedCount} edited)
                </span>
              )}
            </h3>
            <button onClick={() => setShowLineups((v) => !v)}>
              {showLineups ? 'Hide' : 'Show'}
            </button>
          </div>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
            Auto-picked XIs for {season} giornata {giornata}. Edit only if you want to override the default.
          </p>

          {showLineups && (
            <div className="lineup-grid">
              {Object.entries(lineupData.clubs).map(([clubName, club]) => (
                <LineupCard
                  key={clubName}
                  clubName={clubName}
                  club={club}
                  override={overrides[clubName]}
                  onChange={(ids) => setClubLineup(clubName, ids)}
                  onReset={() => resetClubLineup(clubName)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ ...card, borderColor: 'crimson', color: 'crimson' }}>
          {error}
        </div>
      )}

      {result && <ResultView r={result} />}
    </>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', gap: 4 }}>
      <span style={{ color: '#666' }}>{label}</span>
      {children}
    </label>
  )
}

function LineupCard({ clubName, club, override, onChange, onReset }) {
  const currentIds = override || club.xi.map((p) => p.player_id)
  const isEdited = !!override
  const byId = Object.fromEntries(club.pool.map((p) => [p.player_id, p]))

  function swapPlayer(index, newId) {
    const next = [...currentIds]
    next[index] = Number(newId)
    onChange(next)
  }

  return (
    <div className={`lineup-card${isEdited ? ' edited' : ''}`}>
      <div className="lineup-head">
        <strong>{clubName}</strong>
        {isEdited && (
          <button onClick={onReset} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
            reset
          </button>
        )}
      </div>
      {currentIds.map((pid, i) => {
        const player = byId[pid]
        if (!player) return null
        return (
          <div className="lineup-row" key={i}>
            <span className={`lineup-badge ${player.line}`}>{player.line}</span>
            <select value={pid} onChange={(e) => swapPlayer(i, e.target.value)}>
              {club.pool.map((p) => (
                <option key={p.player_id} value={p.player_id}>
                  {p.long_name} {p.overall != null ? `(${p.overall})` : ''}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

function ResultView({ r }) {
  const a = r.a
  const b = r.b
  const [topH, topA, topPct] = r.top_scoreline

  const simulated = r.fixture_summary.length
  const total = r.total_fixtures
  const skipped = total - simulated

  return (
    <>
      <div style={{ ...card, textAlign: 'center', padding: '1.5rem 1rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: 4 }}>
          {r.season} · giornata {r.giornata} · {r.num_sims} simulations
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '1.5rem', fontSize: '1.05rem',
        }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{a.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {a.avg_goals.toFixed(2)} goals · {a.avg_points.toFixed(1)} pts
            </div>
          </div>

          <div style={{
            background: '#111', color: '#fff',
            padding: '0.75rem 1.5rem', borderRadius: 10,
            fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.05em',
          }}>
            {topH} – {topA}
          </div>

          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 600 }}>{b.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {b.avg_goals.toFixed(2)} goals · {b.avg_points.toFixed(1)} pts
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
          most common individual scoreline ({topPct.toFixed(1)}% of sims)
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '2rem',
          marginTop: '1rem', fontWeight: 600,
        }}>
          <span>{a.win_pct.toFixed(1)}% <small style={{ color: '#888', fontWeight: 400 }}>{a.name} win</small></span>
          <span>{r.draw_pct.toFixed(1)}% <small style={{ color: '#888', fontWeight: 400 }}>draw</small></span>
          <span>{b.win_pct.toFixed(1)}% <small style={{ color: '#888', fontWeight: 400 }}>{b.name} win</small></span>
        </div>

        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
          more raw points (before goal conversion): {a.name} {r.more_points_a_pct.toFixed(1)}% · {b.name} {r.more_points_b_pct.toFixed(1)}%
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <PlayerTable team={a} />
        <PlayerTable team={b} />
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 0.5rem' }}>Real Serie A fixtures</h3>
        <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
          {simulated} of {total} simulated
          {skipped > 0 && ` (${skipped} skipped — no fantasy player involved)`}
          {' · '}avg scores and outcomes across all {r.num_sims} runs.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Match</th>
              <th style={{ ...th, textAlign: 'right' }}>Avg</th>
              <th style={{ ...th, textAlign: 'right' }}>H%</th>
              <th style={{ ...th, textAlign: 'right' }}>D%</th>
              <th style={{ ...th, textAlign: 'right' }}>A%</th>
              <th style={{ ...th, textAlign: 'right' }}>Most common</th>
            </tr>
          </thead>
          <tbody>
            {r.fixture_summary.map((fx, i) => (
              <tr key={i}>
                <td style={td}>
                  <strong>{fx.home}</strong> <span style={{ color: '#888' }}>vs</span> <strong>{fx.away}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#999' }}>
                    lineups: {fx.home_src} / {fx.away_src}
                  </div>
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fx.avg_home_goals.toFixed(2)}–{fx.avg_away_goals.toFixed(2)}
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fx.home_win_pct.toFixed(0)}</td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fx.draw_pct.toFixed(0)}</td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fx.away_win_pct.toFixed(0)}</td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fx.top_scoreline[0]}–{fx.top_scoreline[1]}{' '}
                  <span style={{ color: '#888' }}>({fx.top_scoreline[2].toFixed(0)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: '#999', fontSize: '0.8rem', textAlign: 'right' }}>
        Ran {r.num_sims} simulations in {r.elapsed_seconds.toFixed(2)}s
      </p>
    </>
  )
}

function PlayerTable({ team }) {
  const players = [...team.players].sort((p, q) => {
    if (p.avg_grade == null && q.avg_grade == null) return 0
    if (p.avg_grade == null) return 1
    if (q.avg_grade == null) return -1
    return q.avg_grade - p.avg_grade
  })

  return (
    <div style={{ ...card, flex: 1, minWidth: 320 }}>
      <h3 style={{ margin: '0 0 0.25rem' }}>{team.name}</h3>
      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
        {team.players.length} players · avg {team.avg_points.toFixed(1)} pts (sd {team.std_points.toFixed(1)})
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Player</th>
            <th style={{ ...th, textAlign: 'right' }}>Avg grade</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const missing = p.avg_grade == null
            return (
              <tr key={p.player_id} style={missing ? { color: '#aaa' } : undefined}>
                <td style={td}>
                  {p.name}
                  <div style={{ fontSize: '0.72rem', color: missing ? '#bbb' : '#888' }}>
                    {p.club ?? 'not in a real lineup'}
                  </div>
                </td>
                <td style={{
                  ...td, textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: missing ? 400 : 600,
                }}>
                  {missing ? '0' : p.avg_grade.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}