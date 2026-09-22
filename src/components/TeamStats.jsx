import { ATTRIBUTES, formatDecimal, formatMoney } from '../utils/teamStats'

export default function TeamStats({ stats }) {
  const summary = [
    ['Players', stats.count],
    ['Avg overall', formatDecimal(stats.avgOverall)],
    ['Avg potential', formatDecimal(stats.avgPotential)],
    ['Avg age', formatDecimal(stats.avgAge)],
    ['Total value', formatMoney(stats.totalValue)],
    ['Total wage', formatMoney(stats.totalWage)],
  ]

  return (
    <div>
      <div className="stat-cards">
        {summary.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <h3>Average attributes</h3>
      {ATTRIBUTES.map(({ key, label }) => (
        <div className="attr-row" key={key}>
          <span>{label}</span>
          <progress max="100" value={stats.attributes[key] ?? 0} />
          <span>{formatDecimal(stats.attributes[key])}</span>
        </div>
      ))}

      <h3>Squad by line</h3>
      <p>
        {Object.entries(stats.lines).map(([line, n]) => (
          <span key={line} style={{ marginRight: '1rem' }}>
            {line}: <strong>{n}</strong>
          </span>
        ))}
      </p>
    </div>
  )
}