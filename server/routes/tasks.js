const express = require("express")
const Task = require("../models/Task")
const auth = require("../middleware/auth")
const geminiService = require("../services/geminiService")

const router = express.Router()


router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({ message: "Server error while fetching tasks" })
  }
})


router.post("/create", auth, async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Task title is required" })
    }

    
    let subtasks
    try {
      subtasks = await geminiService.generateTaskPlan(title)
    } catch (aiError) {
      console.error("AI generation error:", aiError)
      return res.status(500).json({
        message: "Failed to generate AI task plan",
        error: aiError.message,
      })
    }

    
    const task = new Task({
      title: title.trim(),
      description: description?.trim() || "",
      userId: req.user._id,
      subtasks: subtasks,
      aiGenerated: true,
    })

    await task.save()

    res.status(201).json({
      message: "Task created successfully with AI-generated plan",
      task,
    })
  } catch (error) {
    console.error("Create task error:", error)
    res.status(500).json({ message: "Server error while creating task" })
  }
})


router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    console.error("Get task error:", error)
    res.status(500).json({ message: "Server error while fetching task" })
  }
})


router.put("/:id/subtask/:subtaskId/complete", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    const subtask = task.subtasks.id(req.params.subtaskId)
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" })
    }

    
    subtask.completed = !subtask.completed
    subtask.completedAt = subtask.completed ? new Date() : null

    
    task.checkCompletion()

    await task.save()

    res.json({
      message: "Subtask updated successfully",
      task,
      subtaskCompleted: subtask.completed,
    })
  } catch (error) {
    console.error("Update subtask error:", error)
    res.status(500).json({ message: "Server error while updating subtask" })
  }
})


router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    res.status(500).json({ message: "Server error while deleting task" })
  }
})

router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Task title is required" })
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    task.title = title.trim()
    task.description = description?.trim() || ""

    await task.save()

    res.json({
      message: "Task updated successfully",
      task,
    })
  } catch (error) {
    console.error("Update task error:", error)
    res.status(500).json({ message: "Server error while updating task" })
  }
})

router.get("/stats/overview", auth, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ userId: req.user._id })
    const completedTasks = await Task.countDocuments({
      userId: req.user._id,
      completed: true,
    })

    const tasks = await Task.find({ userId: req.user._id })
    let totalSubtasks = 0
    let completedSubtasks = 0

    tasks.forEach((task) => {
      totalSubtasks += task.subtasks.length
      completedSubtasks += task.subtasks.filter((subtask) => subtask.completed).length
    })

    res.json({
      totalTasks,
      completedTasks,
      activeTasks: totalTasks - completedTasks,
      totalSubtasks,
      completedSubtasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      subtaskCompletionRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ message: "Server error while fetching statistics" })
  }
})

module.exports = router
