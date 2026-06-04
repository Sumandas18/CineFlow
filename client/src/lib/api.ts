import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true, // Important for cookies/sessions
});

// Optional: Add interceptors for error handling or auth tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is 401 Unauthorized
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Don't redirect to login if already on landing page, login, signup pages, or admin pages
      if (
        !currentPath.includes('/login') && 
        !currentPath.includes('/signup') && 
        !currentPath.includes('/cineflow-admin') && 
        currentPath !== '/'
      ) {
        window.location.href = "/login";
      }
    }
    
    // Check if error is 503 Service Unavailable (Maintenance Mode)
    if (error.response?.status === 503 && typeof window !== "undefined") {
      if (!window.location.pathname.includes('/maintenance') && !window.location.pathname.includes('/cineflow-admin')) {
        window.location.href = "/maintenance";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
