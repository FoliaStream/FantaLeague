import { Routes, Route, NavLink } from 'react-router-dom'
import PlayersPage from './pages/PlayersPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import ComparePage from './pages/ComparePage'
import SimulatePage from './pages/SimulatePage'

export default function App() {
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <span className="app-nav__brand">FantaLeague</span>
        <NavLink to="/" end className="app-nav__link">Players</NavLink>
        <NavLink to="/teams" className="app-nav__link">Team builder</NavLink>
        <NavLink to="/compare" className="app-nav__link">Compare</NavLink>
        <NavLink to="/simulate" className="app-nav__link">Simulate</NavLink>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path='/' element={<PlayersPage />} />
          <Route path='/teams' element={<TeamBuilderPage />} />
          <Route path='/compare' element={<ComparePage />} />
          <Route path='/simulate' element={<SimulatePage />} />
        </Routes>
      </main>
    </div>
  )
}