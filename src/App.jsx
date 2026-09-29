import { Routes, Route, NavLink } from 'react-router-dom'
import PlayersPage from './pages/PlayersPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import ComparePage from './pages/ComparePage'
import SimulatePage from './pages/SimulatePage'

export default function App() {
  return (
    <>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <NavLink to="/">Players</NavLink>
        <NavLink to="/teams">Team builder</NavLink>
        <NavLink to="/compare">Compare</NavLink>
        <NavLink to="/simulate">Simulate</NavLink>
      </nav>
      <main style={{ padding: '0 1rem'}}>
        <Routes>
          <Route path='/' element={<PlayersPage />} />
          <Route path='/teams' element={<TeamBuilderPage />} />
          <Route path='/compare' element={<ComparePage />} />
          <Route path='/simulate' element={<SimulatePage />} />
        </Routes>
      </main>
    </>
  )
}