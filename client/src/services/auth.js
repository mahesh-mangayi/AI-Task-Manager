import { authAPI } from "./api"

class AuthService {
  constructor() {
    this.token = localStorage.getItem("token")
    this.user = JSON.parse(localStorage.getItem("user") || "null")
  }

  async register(userData) {
    try {
      const response = await authAPI.register(userData)
      const { token, user } = response.data

      this.setAuthData(token, user)
      return { success: true, user }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  async login(credentials) {
    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response.data

      this.setAuthData(token, user)
      return { success: true, user }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  async getCurrentUser() {
    if (!this.token) return null

    try {
      const response = await authAPI.getCurrentUser()
      return response.data.user
    } catch (error) {
      this.logout()
      return null
    }
  }

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.token = null
    this.user = null

    // Call logout endpoint (optional)
    if (this.token) {
      authAPI.logout().catch(() => {
        // Ignore errors on logout
      })
    }
  }

  setAuthData(token, user) {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    this.token = token
    this.user = user
  }

  isAuthenticated() {
    return !!this.token
  }

  getUser() {
    return this.user
  }

  getToken() {
    return this.token
  }
}

export default new AuthService()
