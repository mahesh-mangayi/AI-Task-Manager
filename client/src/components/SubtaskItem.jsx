"use client"

import { useState } from "react"
import "../styles/SubtaskItem.css"

const SubtaskItem = ({ subtask, onToggle }) => {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      await onToggle()
    } finally {
      setIsToggling(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ef4444"
      case "Medium":
        return "#f59e0b"
      case "Low":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "High":
        return "🔴"
      case "Medium":
        return "🟡"
      case "Low":
        return "🟢"
      default:
        return "⚪"
    }
  }

  return (
    <div className={`subtask-item ${subtask.completed ? "completed" : ""}`}>
      <div className="subtask-main">
        <button
          className={`subtask-checkbox ${subtask.completed ? "completed" : ""}`}
          onClick={handleToggle}
          disabled={isToggling}
        >
          {isToggling ? <div className="checkbox-spinner"></div> : subtask.completed ? "✓" : ""}
        </button>

        <div className="subtask-content">
          <div className="subtask-header">
            <h3 className={`subtask-title ${subtask.completed ? "completed" : ""}`}>{subtask.title}</h3>
            <div className="subtask-badges">
              <span
                className="priority-badge"
                style={{
                  backgroundColor: `${getPriorityColor(subtask.priority)}20`,
                  color: getPriorityColor(subtask.priority),
                  borderColor: `${getPriorityColor(subtask.priority)}40`,
                }}
              >
                {getPriorityIcon(subtask.priority)} {subtask.priority}
              </span>
              <span className="duration-badge">⏱️ {subtask.duration}</span>
            </div>
          </div>

          <p className={`subtask-description ${subtask.completed ? "completed" : ""}`}>{subtask.description}</p>

          {subtask.completedAt && (
            <div className="completion-info">
              <span className="completion-date">
                ✅ Completed on {new Date(subtask.completedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="subtask-order">
        <span className="order-number">#{subtask.order}</span>
      </div>
    </div>
  )
}

export default SubtaskItem
