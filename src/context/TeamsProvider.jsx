import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client'
import { TeamsContext, MAX_PLAYERS } from './TeamsContext'

// backend uses player_ids; the rest of the app expects playerIds
function fromApi(team) {
  return { id: team.id, name: team.name, playerIds: team.player_ids ?? [] }
}

export function TeamsProvider({ children }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [teams, setTeams] = useState([])
  const [activeTeamId, setActiveTeamId] = useState(null)
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [teamsError, setTeamsError] = useState(null)

  // load all players once for the whole app
  useEffect(() => {
    apiGet('/items')
      .then((data) => setPlayers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // load teams from the API once on mount
  useEffect(() => {
    apiGet('/teams')
      .then((data) => {
        const loaded = Array.isArray(data) ? data.map(fromApi) : []
        setTeams(loaded)
        setActiveTeamId((cur) => cur ?? loaded[0]?.id ?? null)
      })
      .catch((err) => setTeamsError(err.message))
      .finally(() => setTeamsLoading(false))
  }, [])

  const playersById = useMemo(
    () => new Map(players.map((p) => [p.player_id, p])),
    [players]
  )

  async function createTeam(name) {
    const created = await apiPost('/teams', { name: name.trim() || 'Untitled team' })
    const team = fromApi(created)
    setTeams((prev) => [...prev, team])
    setActiveTeamId(team.id)
  }

  async function deleteTeam(id) {
    await apiDelete(`/teams/${id}`)
    setTeams((prev) => prev.filter((t) => t.id !== id))
    setActiveTeamId((cur) => (cur === id ? null : cur))
  }

  async function addPlayer(teamId, playerId) {
    const team = teams.find((t) => t.id === teamId)
    if (!team || team.playerIds.includes(playerId) || team.playerIds.length >= MAX_PLAYERS) return

    const nextPlayerIds = [...team.playerIds, playerId]
    // optimistic update
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, playerIds: nextPlayerIds } : t)))
    try {
      await apiPut(`/teams/${teamId}/players`, { player_ids: nextPlayerIds })
    } catch (err) {
      // roll back on failure
      setTeams((prev) => prev.map((t) => (t.id === teamId ? team : t)))
      setTeamsError(err.message)
    }
  }

  async function removePlayer(teamId, playerId) {
    const team = teams.find((t) => t.id === teamId)
    if (!team) return

    const nextPlayerIds = team.playerIds.filter((id) => id !== playerId)
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, playerIds: nextPlayerIds } : t)))
    try {
      await apiPut(`/teams/${teamId}/players`, { player_ids: nextPlayerIds })
    } catch (err) {
      setTeams((prev) => prev.map((t) => (t.id === teamId ? team : t)))
      setTeamsError(err.message)
    }
  }

  function getTeamPlayers(team) {
    return team.playerIds.map((id) => playersById.get(id)).filter(Boolean)
  }

  const value = {
    players, loading, error,
    teams, activeTeamId, setActiveTeamId,
    teamsLoading, teamsError,
    createTeam, deleteTeam, addPlayer, removePlayer, getTeamPlayers,
  }

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
}