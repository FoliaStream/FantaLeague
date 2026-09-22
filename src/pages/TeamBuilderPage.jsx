import { useState } from 'react'
import { useTeams, MAX_PLAYERS } from '../context/TeamsContext'
import TeamStats from '../components/TeamStats'
import { computeTeamStats, formatMoney } from '../utils/teamStats'

// lets "modric" match "Modrić"
const normalize = (s) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function TeamBuilderPage() {
  const {
    players, loading, error,
    teams, activeTeamId, setActiveTeamId,
    createTeam, deleteTeam, addPlayer, removePlayer, getTeamPlayers,
  } = useTeams()

  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')

  const activeTeam = teams.find((t) => t.id === activeTeamId) ?? teams[0] ?? null
  const roster = activeTeam ? getTeamPlayers(activeTeam) : []
  const stats = computeTeamStats(roster)
  const isFull = roster.length >= MAX_PLAYERS

  const query = normalize(search.trim())
  const results = query
    ? players
        .filter((p) => normalize(`${p.long_name} ${p.short_name}`).includes(query))
        .filter((p) => !activeTeam?.playerIds.includes(p.player_id))
        .slice(0, 15)
    : []

  function handleCreate(e) {
    e.preventDefault()
    createTeam(newName)
    setNewName('')
  }

  function handleDelete() {
    if (window.confirm(`Delete "${activeTeam.name}"?`)) deleteTeam(activeTeam.id)
  }

  if (loading) return <p>Loading players...</p>
  if (error) return <p style={{ color: 'crimson' }}>Could not load players: {error}</p>

  return (
    <>
      <h1>Team builder</h1>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {teams.length > 0 && (
          <>
            <select
              value={activeTeam.id}
              onChange={(e) => setActiveTeamId(e.target.value)}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.playerIds.length})
                </option>
              ))}
            </select>
            <button onClick={handleDelete}>Delete team</button>
          </>
        )}
        <form onSubmit={handleCreate}>
          <input
            placeholder="New team name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit">Create team</button>
        </form>
      </div>

      {!activeTeam && <p>Create your first team to start picking players.</p>}

      {activeTeam && (
        <div className="builder">
          <section>
            <h2>Add players</h2>
            <input
              placeholder="Search players by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isFull && <p>Squad is full ({MAX_PLAYERS} players).</p>}
            {query && results.length === 0 && <p>No players found.</p>}
            {results.length > 0 && (
              <table>
                <tbody>
                  {results.map((p) => (
                    <tr key={p.player_id}>
                      <td>{p.long_name}</td>
                      <td>{p.player_positions}</td>
                      <td>{p.overall}</td>
                      <td>
                        <button
                          disabled={isFull}
                          onClick={() => addPlayer(activeTeam.id, p.player_id)}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h2>
              {activeTeam.name} ({roster.length}/{MAX_PLAYERS})
            </h2>
            {roster.length === 0 ? (
              <p>No players yet. Search above and click Add.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Pos</th>
                    <th>Ovr</th>
                    <th>Age</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((p) => (
                    <tr key={p.player_id}>
                      <td>{p.long_name}</td>
                      <td>{p.player_positions}</td>
                      <td>{p.overall}</td>
                      <td>{p.age}</td>
                      <td>{formatMoney(p.value_eur)}</td>
                      <td>
                        <button onClick={() => removePlayer(activeTeam.id, p.player_id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h2>Team statistics</h2>
            <TeamStats stats={stats} />
          </section>
        </div>
      )}
    </>
  )
}