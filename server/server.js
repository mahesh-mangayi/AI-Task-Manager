const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
require("dotenv").config()



process.env.JWT_SECRET = process.env.JWT_SECRET || "dev_secret"

const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/tasks")

const app = express()

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})


app.use(limiter)
app.use(cors(
  {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
  }
))
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)


mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ai-task-manager")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

  

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
