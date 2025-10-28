"use client"

import { useState, useEffect } from "react"
import { taskAPI } from "../services/api"
import authService from "../services/auth"
import TaskCreator from "../components/TaskCreator"
import TaskCard from "../components/TaskCard"
import StatsOverview from "../components/StatsOverview"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all") // all, active, completed

  const user = authService.getUser()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [tasksResponse, statsResponse] = await Promise.all([
        taskAPI.getAllTasks(),
        taskAPI.getStats ? taskAPI.getStats() : Promise.resolve({ data: null }),
      ])

      setTasks(tasksResponse.data)
      if (statsResponse.data) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error("Dashboard load error:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev])
    loadDashboardData() // Refresh stats
  }

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId))
    loadDashboardData() // Refresh stats
  }

  const handleLogout = () => {
    authService.logout()
    window.location.href = "/login"
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your learning journey...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>TaskMind AI</h1>
            <p>Welcome back, {user?.username}!</p>
          </div>
          <div className="header-right">
            <button className="create-task-button" onClick={() => setShowTaskCreator(true)}>
              + New Learning Goal
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {stats && <StatsOverview stats={stats} />}

        <section className="tasks-section">
          <div className="tasks-header">
            <h2>Your Learning Goals</h2>
            <div className="task-filters">
              <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
                All ({tasks.length})
              </button>
              <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>
                Active ({tasks.filter((t) => !t.completed).length})
              </button>
              <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>
                Completed ({tasks.filter((t) => t.completed).length})
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              {tasks.length === 0 ? (
                <>
                  <div className="empty-icon">🎯</div>
                  <h3>Start Your Learning Journey</h3>
                  <p>Create your first AI-powered learning goal and get a personalized step-by-step plan.</p>
                  <button className="create-first-task-button" onClick={() => setShowTaskCreator(true)}>
                    Create Your First Goal
                  </button>
                </>
              ) : (
                <>
                  <div className="empty-icon">📋</div>
                  <h3>No {filter} tasks</h3>
                  <p>Try switching to a different filter or create a new learning goal.</p>
                </>
              )}
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <TaskCard key={task._id} task={task} onTaskDeleted={handleTaskDeleted} />
              ))}
            </div>
          )}
        </section>
      </main>

      {showTaskCreator && <TaskCreator onTaskCreated={handleTaskCreated} onClose={() => setShowTaskCreator(false)} />}
    </div>
  )
}

export default Dashboard
