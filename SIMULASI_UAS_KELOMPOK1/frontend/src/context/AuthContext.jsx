import { createContext, useState, useContext } from "react";
import { apiClient } from "../api/axiosConfig";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

// Helper function to get initial state from token
const getAuthFromToken = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 > Date.now()) {
        return { token: token, user: decoded.username, role: decoded.role };
      } else {
        // Token is expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } catch (e) {
      console.error("Invalid token:", e);
    }
  }
  return { token: null, user: null, role: null };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getAuthFromToken());

  const login = async (username, password) => {
    try {
      const response = await apiClient.post("/token/", { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Decode token to get user info
      const decoded = jwtDecode(access);
      setAuth({ token: access, user: decoded.username, role: decoded.role });

      return { success: true, role: decoded.role };
    } catch (error) {
      console.error("Login failed:", error);
      setAuth({ token: null, user: null, role: null });
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuth({ token: null, user: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
