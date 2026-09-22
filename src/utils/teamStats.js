export const ATTRIBUTES = [
    { key: 'pace', label: 'Pace' },
    { key: 'shooting', label: 'Shooting' },
    { key: 'passing', label: 'Passing' },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'defending', label: 'Defending' },
    { key: 'physic', label: 'Physic' },
  ]
  
  const LINE_BY_POSITION = {
    GK: 'GK',
    CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
    CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
    ST: 'ATT', CF: 'ATT', LW: 'ATT', RW: 'ATT',
  }
  
  // a player's line comes from the first position in "CB, RB, RM"
  export function getLine(player) {
    const main = player.player_positions?.split(',')[0]?.trim()
    return LINE_BY_POSITION[main] ?? null
  }
  
  // average that skips empty values (goalkeepers have no pace, shooting, etc.)
  function average(players, key) {
    const values = players
      .map((p) => p[key])
      .filter((v) => v != null && !Number.isNaN(Number(v)))
      .map(Number)
    if (!values.length) return null
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  
  function sum(players, key) {
    return players.reduce((total, p) => total + (Number(p[key]) || 0), 0)
  }
  
  export function computeTeamStats(players) {
    const lines = { GK: 0, DEF: 0, MID: 0, ATT: 0 }
    players.forEach((p) => {
      const line = getLine(p)
      if (line) lines[line] += 1
    })
  
    const attributes = {}
    ATTRIBUTES.forEach(({ key }) => {
      attributes[key] = average(players, key)
    })
  
    return {
      count: players.length,
      avgOverall: average(players, 'overall'),
      avgPotential: average(players, 'potential'),
      avgAge: average(players, 'age'),
      totalValue: sum(players, 'value_eur'),
      totalWage: sum(players, 'wage_eur'),
      attributes,
      lines,
    }
  }
  
  export function formatDecimal(n, digits = 1) {
    return n == null ? '–' : n.toFixed(digits)
  }
  
  export function formatMoney(n) {
    if (n == null) return '–'
    if (n >= 1e6) return `€${(n / 1e6).toFixed(1)}M`
    if (n >= 1e3) return `€${(n / 1e3).toFixed(0)}K`
    return `€${n}`
  }