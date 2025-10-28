import { useEffect, useState } from "react"
import "../styles/CompletionCelebration.css"

const CompletionCelebration = ({ task, onClose }) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    
    const timer = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300) 
  }

  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
  const totalSubtasks = task.subtasks.length

  return (
    <div className={`celebration-overlay ${show ? "show" : ""}`}>
      <div className={`celebration-modal ${show ? "show" : ""}`}>
        <div className="celebration-content">
          <div className="celebration-icon">🎉</div>

          <h2 className="celebration-title">Congratulations!</h2>

          <p className="celebration-message">
            You've completed your learning goal: <strong>"{task.title}"</strong>
          </p>

          <div className="celebration-stats">
            <div className="stat-item">
              <div className="stat-number">{completedSubtasks}</div>
              <div className="stat-label">Steps Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{totalSubtasks}</div>
              <div className="stat-label">Total Steps</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Progress</div>
            </div>
          </div>

          <div className="celebration-actions">
            <button className="celebration-button" onClick={handleClose}>
              Continue Learning
            </button>
          </div>
        </div>

        <div className="confetti">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`confetti-piece confetti-${i % 4}`}></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompletionCelebration
