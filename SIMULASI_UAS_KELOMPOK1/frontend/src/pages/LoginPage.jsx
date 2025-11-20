import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    setError("");
    const result = await login(username, password);

    if (result.success) {
      if (result.role === "seller") {
        navigate("/manage-products", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-centered">
        <div className="login-header">
          <Link to="/register" className="register-link">
            Don't have an account? <span>SIGN UP</span>
          </Link>
        </div>

        <div className="login-form-wrapper">
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Login to your account</p>

          {error && <div className="modern-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="modern-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M3 3L21 21M10.5 10.5C10.0353 10.9647 9.75 11.6002 9.75 12.3C9.75 13.7912 10.9588 15 12.45 15C13.1498 15 13.7853 14.7147 14.25 14.25M17.94 17.94C16.2306 19.243 14.1491 20 12 20C7.58172 20 4 16.4183 4 12C4 9.85087 4.75704 7.76935 6.06 6.06M9.88 9.88C10.4216 9.33851 11.1899 9 12 9C13.6569 9 15 10.3431 15 12C15 12.8101 14.6615 13.5784 14.12 14.12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                        strokeWidth="2"
                      />
                      <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="modern-submit-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
