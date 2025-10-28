import axios from "axios"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta?.env?.VITE_API_URL) || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || ""
      // Do not force a full page reload for failed login attempts
      if (requestUrl.includes("/auth/login")) {
        return Promise.reject(error)
      }

      // For other 401s (e.g., expired/invalid token), clear stored auth and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
}

// Task API calls
export const taskAPI = {
  getAllTasks: () => api.get("/tasks"),
  createTask: (taskData) => api.post("/tasks/create", taskData),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  updateTask: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData),
  completeSubtask: (taskId, subtaskId) => api.put(`/tasks/${taskId}/subtask/${subtaskId}/complete`),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  getStats: () => api.get("/tasks/stats/overview"),
}

export default api
