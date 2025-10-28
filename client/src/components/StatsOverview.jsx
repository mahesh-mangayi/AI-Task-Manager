import "../styles/StatsOverview.css"

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      title: "Total Goals",
      value: stats.totalTasks,
      icon: "🎯",
      color: "#667eea",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: "✅",
      color: "#10b981",
    },
    {
      title: "In Progress",
      value: stats.activeTasks,
      icon: "⚡",
      color: "#f59e0b",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: "📊",
      color: "#8b5cf6",
    },
  ]

  return (
    <section className="stats-overview">
      <h2>Your Progress</h2>
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {stats.totalSubtasks > 0 && (
        <div className="detailed-progress">
          <div className="progress-section">
            <h3>Overall Step Progress</h3>
            <div className="progress-bar-large">
              <div className="progress-fill-large" style={{ width: `${stats.subtaskCompletionRate}%` }} />
            </div>
            <div className="progress-details">
              <span>
                {stats.completedSubtasks} of {stats.totalSubtasks} steps completed
              </span>
              <span>{stats.subtaskCompletionRate}%</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default StatsOverview
