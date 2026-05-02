import React, { useState } from "react";
import "../styles/Login.css";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedin, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("email", email); // ✅ Email save
        window.dispatchEvent(new Event("profileUpdated"));

        navigate("/after-login");
      } else {
        await axios.post("http://localhost:5000/api/auth/signup", {
          name,
          email,
          password,
        });

        alert("Signup successful, please login");
        setIsLogin(true);
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <h2 className="title">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h2>

          <p className="subtitle">
            {isLogin
              ? "Please enter your login details"
              : "Start tracking your developer journey"}
          </p>

          <div className="toggle-container">
            <button
              className={isLogin ? "toggle active" : "toggle"}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>

            <button
              className={!isLogin ? "toggle active" : "toggle"}
              onClick={() => setIsLogin(false)}
            >
              Signup
            </button>
          </div>

          <form
            className={`form ${isLogin ? "login-mode" : "signup-mode"}`}
            onSubmit={handleSubmit}
          >
            {!isLogin && (
              <div className="floating-input">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label>Full Name</label>
              </div>
            )}

            <div className="floating-input">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email</label>
            </div>

            <div className="floating-input password-field">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="submit-btn">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="social-login">
            <button className="social google">
              <FcGoogle size={22} />
            </button>

            <button className="social github">
              <FaGithub size={20} />
            </button>

            <button className="social linkedin">
              <FaLinkedin size={20} />
            </button>
          </div>
        </div>

        <div className="login-right">
          <h2>What Developers Say</h2>

          <p className="quote">
            Track your coding progress and grow your developer journey faster
            with devProgress.
          </p>

          <div className="info-card">
            <h3>Track your growth</h3>
            <p>
              Visualize your coding journey in a single dashboard and stay
              motivated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;