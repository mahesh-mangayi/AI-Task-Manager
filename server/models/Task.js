const mongoose = require("mongoose")

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subtasks: [subtaskSchema],
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)


taskSchema.methods.checkCompletion = function () {
  const allCompleted = this.subtasks.every((subtask) => subtask.completed)
  if (allCompleted && !this.completed) {
    this.completed = true
    this.completedAt = new Date()
  } else if (!allCompleted && this.completed) {
    this.completed = false
    this.completedAt = null
  }
}

module.exports = mongoose.model("Task", taskSchema)
