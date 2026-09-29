// utils/formations.js

const POSITION_TO_LINE = {
    GK: 'P',
    CB: 'D', RB: 'D', LB: 'D', RWB: 'D', LWB: 'D',
    CDM: 'C', CM: 'C', CAM: 'C', RM: 'C', LM: 'C',
    RW: 'A', LW: 'A', ST: 'A', CF: 'A',
  }
  
  export const VALID_FORMATIONS = {
    '3-4-3': { D: 3, C: 4, A: 3 },
    '3-5-2': { D: 3, C: 5, A: 2 },
    '4-3-3': { D: 4, C: 3, A: 3 },
    '4-4-2': { D: 4, C: 4, A: 2 },
    '4-5-1': { D: 4, C: 5, A: 1 },
    '5-3-2': { D: 5, C: 3, A: 2 },
    '5-4-1': { D: 5, C: 4, A: 1 },
  }
  
  // a player's single fantacalcio line, derived from their PRIMARY position only
  export function getPlayerLine(player) {
    return POSITION_TO_LINE[player.position] ?? null
  }
  
  export function validateFormation(selectedPlayers, formationKey) {
    const formation = VALID_FORMATIONS[formationKey]
    if (!formation) return { valid: false, error: 'Unknown formation' }
    if (selectedPlayers.length !== 11) return { valid: false, error: 'Must select exactly 11 players' }
  
    const counts = { P: 0, D: 0, C: 0, A: 0 }
    for (const p of selectedPlayers) {
      const line = getPlayerLine(p)
      if (!line) return { valid: false, error: `Unknown position for player: ${p.long_name ?? p.player_id}` }
      counts[line]++
    }
  
    if (counts.P !== 1) return { valid: false, error: 'Must select exactly 1 goalkeeper' }
    if (counts.D !== formation.D || counts.C !== formation.C || counts.A !== formation.A) {
      return {
        valid: false,
        error: `Formation ${formationKey} needs ${formation.D}D-${formation.C}C-${formation.A}A, got ${counts.D}D-${counts.C}C-${counts.A}A`,
      }
    }
  
    return { valid: true }
  }