import "../styles/ProgressInsights.css"

const ProgressInsights = ({ task }) => {
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
  const totalSubtasks = task.subtasks.length
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  
  const remainingSubtasks = task.subtasks.filter((subtask) => !subtask.completed)
  const totalEstimatedMinutes = remainingSubtasks.reduce((total, subtask) => {
    const duration = subtask.duration.toLowerCase()
    let minutes = 0

    if (duration.includes("hour")) {
      const hours = Number.parseFloat(duration.match(/(\d+(?:\.\d+)?)/)?.[1] || 0)
      minutes = hours * 60
    } else if (duration.includes("minute")) {
      minutes = Number.parseFloat(duration.match(/(\d+(?:\.\d+)?)/)?.[1] || 0)
    } else if (duration.includes("day")) {
      const days = Number.parseFloat(duration.match(/(\d+(?:\.\d+)?)/)?.[1] || 0)
      minutes = days * 8 * 60 // Assume 8 hours per day
    }

    return total + minutes
  }, 0)

  const formatTimeRemaining = (minutes) => {
    if (minutes === 0) return "Complete!"
    if (minutes < 60) return `${Math.round(minutes)} minutes`
    if (minutes < 480) return `${Math.round(minutes / 60)} hours`
    return `${Math.round(minutes / 480)} days`
  }

  
  const priorityBreakdown = task.subtasks.reduce((acc, subtask) => {
    if (!subtask.completed) {
      acc[subtask.priority] = (acc[subtask.priority] || 0) + 1
    }
    return acc
  }, {})

  
  const nextSubtask = task.subtasks
    .filter((subtask) => !subtask.completed)
    .sort((a, b) => {
      
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      return priorityDiff !== 0 ? priorityDiff : a.order - b.order
    })[0]

  if (task.completed) {
    return (
      <div className="progress-insights completed">
        <div className="insights-header">
          <h3>🎉 Goal Completed!</h3>
        </div>
        <div className="completion-summary">
          <p>You've successfully completed all {totalSubtasks} learning steps!</p>
          <div className="completion-date">Finished on {new Date(task.completedAt).toLocaleDateString()}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="progress-insights">
      <div className="insights-header">
        <h3>📊 Progress Insights</h3>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">⏱️</div>
          <div className="insight-content">
            <div className="insight-value">{formatTimeRemaining(totalEstimatedMinutes)}</div>
            <div className="insight-label">Estimated Time Remaining</div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <div className="insight-value">{totalSubtasks - completedSubtasks}</div>
            <div className="insight-label">Steps Remaining</div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <div className="insight-value">{Math.round(progressPercentage)}%</div>
            <div className="insight-label">Progress Made</div>
          </div>
        </div>
      </div>

      {Object.keys(priorityBreakdown).length > 0 && (
        <div className="priority-breakdown">
          <h4>Remaining by Priority</h4>
          <div className="priority-items">
            {Object.entries(priorityBreakdown).map(([priority, count]) => (
              <div key={priority} className={`priority-item priority-${priority.toLowerCase()}`}>
                <span className="priority-dot"></span>
                <span className="priority-text">
                  {priority}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {nextSubtask && (
        <div className="next-recommendation">
          <h4>🚀 Recommended Next Step</h4>
          <div className="next-subtask">
            <div className="next-subtask-title">{nextSubtask.title}</div>
            <div className="next-subtask-meta">
              <span className={`priority-badge priority-${nextSubtask.priority.toLowerCase()}`}>
                {nextSubtask.priority}
              </span>
              <span className="duration-badge">{nextSubtask.duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressInsights
