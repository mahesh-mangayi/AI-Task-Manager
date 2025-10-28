const { GoogleGenerativeAI } = require("@google/generative-ai")

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      this.genAI = null
      return
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  }
  async generateTaskPlan(userGoal) {
    if (!this.genAI) {
      throw new Error("Gemini API not configured. Please add GEMINI_API_KEY to environment variables.")
    }

    const prompt = `Generate a detailed step-by-step learning plan for: "${userGoal}"

Please provide a structured response with required number of subtasks which cover all the topics about that course. For each subtask, include:
- title: A clear, concise title (max 50 characters)
- description: Detailed explanation of what to do (100-200 characters)
- duration: Estimated time needed (e.g., "2 hours", "30 minutes", "1 day")
- priority: Either "High", "Medium", or "Low"
- order: Sequential number starting from 1

Format your response as a JSON array of objects with these exact keys: title, description, duration, priority, order.

Example format:
[
  {
    "title": "Learn the basics",
    "description": "Start with fundamental concepts and core principles",
    "duration": "2 hours",
    "priority": "High",
    "order": 1
  }
]

Make sure the plan is practical, actionable, and progressive from beginner to more advanced concepts.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("Invalid response format from AI")
      }

      const subtasks = JSON.parse(jsonMatch[0])

      if (!Array.isArray(subtasks) || subtasks.length === 0) {
        throw new Error("Invalid subtasks format")
      }

      subtasks.forEach((subtask, index) => {
        if (!subtask.title || !subtask.description || !subtask.duration || !subtask.priority || !subtask.order) {
          throw new Error(`Invalid subtask format at index ${index}`)
        }

        if (!["High", "Medium", "Low"].includes(subtask.priority)) {
          subtask.priority = "Medium" 
        }
      })


      return subtasks
    } catch (error) {
      // console.error("Gemini API Error:", error)

      return [
        {
          title: "Research and Planning",
          description: "Research the topic and create a learning plan",
          duration: "1 hour",
          priority: "High",
          order: 1,
        },
        {
          title: "Learn Fundamentals",
          description: "Study the basic concepts and principles",
          duration: "3 hours",
          priority: "High",
          order: 2,
        },
        {
          title: "Practice Exercises",
          description: "Complete hands-on exercises and examples",
          duration: "2 hours",
          priority: "Medium",
          order: 3,
        },
        {
          title: "Build a Project",
          description: "Apply knowledge by building a practical project",
          duration: "4 hours",
          priority: "Medium",
          order: 4,
        },
        {
          title: "Review and Refine",
          description: "Review what you've learned and identify areas for improvement",
          duration: "1 hour",
          priority: "Low",
          order: 5,
        },
      ]
    }
  }
}

module.exports = new GeminiService()
