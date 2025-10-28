"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { taskAPI } from "../services/api"
import SubtaskItem from "../components/SubtaskItem"
import CompletionCelebration from "../components/CompletionCelebration"
import ProgressInsights from "../components/ProgressInsights"
import "../styles/TaskDetail.css"

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", description: "" })
  const [showCelebration, setShowCelebration] = useState(false)
  const [previouslyCompleted, setPreviouslyCompleted] = useState(false)

  useEffect(() => {
    loadTask()
  }, [id])

  const loadTask = async () => {
    try {
      setLoading(true)
      const response = await taskAPI.getTask(id)
      const taskData = response.data

      if (task && !task.completed && taskData.completed) {
        setShowCelebration(true)
      }
      setPreviouslyCompleted(taskData.completed)

      setTask(taskData)
      setEditForm({
        title: taskData.title,
        description: taskData.description || "",
      })
    } catch (error) {
      console.error("Load task error:", error)
      setError("Failed to load task details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubtaskToggle = async (subtaskId) => {
    try {
      const response = await taskAPI.completeSubtask(id, subtaskId)
      const updatedTask = response.data.task

      if (!task.completed && updatedTask.completed) {
        setShowCelebration(true)
      }

      setTask(updatedTask)
    } catch (error) {
      console.error("Toggle subtask error:", error)
      setError("Failed to update subtask")
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await taskAPI.updateTask(id, editForm)
      setTask(response.data.task)
      setEditing(false)
    } catch (error) {
      console.error("Update task error:", error)
      setError("Failed to update task")
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this learning goal? This action cannot be undone.")) {
      return
    }

    try {
      await taskAPI.deleteTask(id)
      navigate("/dashboard")
    } catch (error) {
      console.error("Delete task error:", error)
      setError("Failed to delete task")
    }
  }

  if (loading) {
    return (
      <div className="task-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading task details...</p>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div className="task-detail-error">
        <h2>Error Loading Task</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="task-detail-error">
        <h2>Task Not Found</h2>
        <p>The requested task could not be found.</p>
        <Link to="/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
  const totalSubtasks = task.subtasks.length
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <div className="task-detail">
      <header className="task-detail-header">
        <div className="header-content">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
          <div className="header-actions">
            <button className="edit-button" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit"}
            </button>
            <button className="delete-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </header>

      <main className="task-detail-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        <div className="task-info-section">
          {editing ? (
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="title">Learning Goal</label>
                <input
                  type="text"
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="task-info">
              <div className="task-header">
                <h1 className="task-title">{task.title}</h1>
                <div className="task-status">
                  {task.completed ? (
                    <span className="status-badge completed">Completed</span>
                  ) : completedSubtasks > 0 ? (
                    <span className="status-badge in-progress">In Progress</span>
                  ) : (
                    <span className="status-badge not-started">Not Started</span>
                  )}
                </div>
              </div>

              {task.description && <p className="task-description">{task.description}</p>}

              <div className="task-meta">
                {task.aiGenerated && (
                  <div className="ai-badge">
                    <span className="ai-icon">🤖</span>
                    <span>AI Generated Plan</span>
                  </div>
                )}
                <div className="task-dates">
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  {task.completedAt && <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <h2>Learning Progress</h2>
            <div className="progress-stats">
              <span>
                {completedSubtasks} of {totalSubtasks} steps completed
              </span>
              <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <div className="progress-bar-large">
            <div className="progress-fill-large" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <ProgressInsights task={task} />

        <div className="subtasks-section">
          <h2>Learning Steps</h2>
          <div className="subtasks-list">
            {task.subtasks
              .sort((a, b) => a.order - b.order)
              .map((subtask) => (
                <SubtaskItem key={subtask._id} subtask={subtask} onToggle={() => handleSubtaskToggle(subtask._id)} />
              ))}
          </div>
        </div>
      </main>
      {showCelebration && task && task.completed && (
        <CompletionCelebration task={task} onClose={() => setShowCelebration(false)} />
      )}
    </div>
  )
}

export default TaskDetail
