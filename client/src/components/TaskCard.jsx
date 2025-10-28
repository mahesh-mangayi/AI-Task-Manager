"use client"

import { Link } from "react-router-dom"
import { useState } from "react"
import { taskAPI } from "../services/api"
import "../styles/TaskCard.css"

const TaskCard = ({ task, onTaskDeleted }) => {
  const [deleting, setDeleting] = useState(false)

  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
  const totalSubtasks = task.subtasks.length
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm("Are you sure you want to delete this learning goal?")) {
      return
    }

    setDeleting(true)
    try {
      await taskAPI.deleteTask(task._id)
      onTaskDeleted(task._id)
    } catch (error) {
      console.error("Delete task error:", error)
      alert("Failed to delete task. Please try again.")
    } finally {
      setDeleting(false)
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

  const getStatusBadge = () => {
    if (task.completed) {
      return <span className="status-badge completed">Completed</span>
    }
    if (completedSubtasks > 0) {
      return <span className="status-badge in-progress">In Progress</span>
    }
    return <span className="status-badge not-started">Not Started</span>
  }

  return (
    <Link to={`/task/${task._id}`} className="task-card">
      <div className="task-card-header">
        <div className="task-title-section">
          <h3 className="task-title">{task.title}</h3>
          {getStatusBadge()}
        </div>
        <button className="delete-button-outside" onClick={handleDelete} disabled={deleting} title="Delete task">
          {deleting ? "..." : "×"}
        </button>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-progress">
        <div className="progress-info">
          <span className="progress-text">
            {completedSubtasks} of {totalSubtasks} steps completed
          </span>
          <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      <div className="task-subtasks-preview">
        {task.subtasks.slice(0, 3).map((subtask, index) => (
          <div key={subtask._id} className="subtask-preview">
            <div className="subtask-info">
              <span className={`subtask-checkbox ${subtask.completed ? "completed" : ""}`}>
                {subtask.completed ? "✓" : ""}
              </span>
              <span className={`subtask-title ${subtask.completed ? "completed" : ""}`}>{subtask.title}</span>
            </div>
            <div className="subtask-meta">
              <span className="priority-dot" style={{ backgroundColor: getPriorityColor(subtask.priority) }} />
              <span className="duration">{subtask.duration}</span>
            </div>
          </div>
        ))}
        {task.subtasks.length > 3 && <div className="more-subtasks">+{task.subtasks.length - 3} more steps</div>}
      </div>

      <div className="task-footer">
        <div className="task-meta">
          {task.aiGenerated && (
            <span className="ai-badge">
              <span className="ai-icon">🤖</span>
              AI Generated
            </span>
          )}
          <span className="created-date">Created {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}

export default TaskCard
