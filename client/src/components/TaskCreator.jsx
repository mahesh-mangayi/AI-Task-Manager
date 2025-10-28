"use client"

import { useState } from "react"
import { taskAPI } from "../services/api"
import "../styles/TaskCreator.css"

const TaskCreator = ({ onTaskCreated, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError("Please enter a learning goal")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await taskAPI.createTask(formData)
      onTaskCreated(response.data.task)
      onClose()
    } catch (error) {
      console.error("Task creation error:", error)
      setError(error.response?.data?.message || "Failed to create task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const exampleGoals = [
    "I want to learn React",
    "Learn Python programming",
    "Master JavaScript fundamentals",
    "Build a portfolio website",
    "Learn data structures and algorithms",
    "Understand machine learning basics",
  ]

  const handleExampleClick = (example) => {
    setFormData({ ...formData, title: example })
  }

  return (
    <div className="task-creator-overlay">
      <div className="task-creator-modal">
        <div className="task-creator-header">
          <h2>Create New Learning Goal</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-creator-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">What do you want to learn?</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., I want to learn React"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Additional details (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Any specific requirements or context..."
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="example-goals">
            <p>Popular learning goals:</p>
            <div className="example-buttons">
              {exampleGoals.map((goal, index) => (
                <button
                  key={index}
                  type="button"
                  className="example-button"
                  onClick={() => handleExampleClick(goal)}
                  disabled={loading}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="create-button" disabled={loading || !formData.title.trim()}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating AI Plan...
                </>
              ) : (
                "Generate Learning Plan"
              )}
            </button>
          </div>
        </form>

        <div className="ai-info">
          <div className="ai-badge">
            <span className="ai-icon">🤖</span>
            <span>Powered by AI</span>
          </div>
          <p>Our AI will create a personalized step-by-step learning plan with estimated durations and priorities.</p>
        </div>
      </div>
    </div>
  )
}

export default TaskCreator
