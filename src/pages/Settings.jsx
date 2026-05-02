import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Settings.css";

const Settings = ({ theme, setTheme })  => {
  const navigate = useNavigate();

  // Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Integrations
  const [github, setGithub] = useState("");
  const [leetcode, setLeetcode] = useState("");

  // Theme
  //const [theme, setTheme] = useState("dark");

  // Notifications
  const [notif, setNotif] = useState({
    streak: true,
    newCert: true,
    weeklyReport: false,
    projectReminder: true,
  });

  // Saved message
  const [saved, setSaved] = useState("");

  const profileName = localStorage.getItem("profileName");
  const githubUser = localStorage.getItem("github");

  useEffect(() => {
    setName(localStorage.getItem("profileName") || "");
    setEmail(localStorage.getItem("email") || "");
    setGithub(localStorage.getItem("github") || "");
    setLeetcode(localStorage.getItem("leetcode") || "");
    setTheme(localStorage.getItem("theme") || "dark");

    const savedNotif = localStorage.getItem("notifications");
    if (savedNotif) setNotif(JSON.parse(savedNotif));
  }, []);

  // Apply theme
  // useEffect(() => {
  //   document.body.setAttribute("data-theme", theme);
  //   localStorage.setItem("theme", theme);
  // }, [theme]);
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);  // ✅ App.jsx ka setTheme call hoga
  };

  const showSaved = (msg) => {
    setSaved(msg);
    setTimeout(() => setSaved(""), 2500);
  };

  const saveAccount = () => {
    if (name) localStorage.setItem("profileName", name);
    if (email) localStorage.setItem("email", email);
    showSaved("✅ Account settings saved!");
  };

  const saveIntegrations = () => {
    localStorage.setItem("github", github);
    localStorage.setItem("leetcode", leetcode);
    showSaved("✅ Integrations saved!");
  };

  const saveNotifications = () => {
    localStorage.setItem("notifications", JSON.stringify(notif));
    showSaved("✅ Notification preferences saved!");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="settings-root">
      <main className="settings-container">
        <div className="settings-header">
          <h1>⚙️ Settings & Preferences</h1>
          <p>Customize your DevProgress experience</p>
        </div>

        {saved && <div className="settings-toast">{saved}</div>}

        {/* THEME */}
        <div className="settings-card">
          <h2>🌙 Theme</h2>
          <p>Choose your preferred appearance</p>

          <div className="theme-toggle-row">
            <button
  className={`theme-btn ${theme === "dark" ? "active" : ""}`}
  onClick={() => handleThemeChange("dark")}
>
  🌙 Dark
</button>
<button
  className={`theme-btn ${theme === "light" ? "active" : ""}`}
  onClick={() => handleThemeChange("light")}
>
  ☀️ Light
</button>
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="settings-card">
          <h2>👤 Account Settings</h2>
          <p>Update your personal information</p>

          <div className="settings-form">
            <div className="settings-field">
              <label>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="settings-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
              />
            </div>

            <div className="settings-field">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="settings-field">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <button className="settings-save-btn" onClick={saveAccount}>
              Save Account
            </button>
          </div>
        </div>

        {/* INTEGRATIONS */}
        <div className="settings-card">
          <h2>🌐 GitHub & LeetCode</h2>
          <p>Update your coding platform usernames</p>

          <div className="settings-form">
            <div className="settings-field">
              <label>GitHub Username</label>
              <input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="e.g. theprince09"
              />
            </div>

            <div className="settings-field">
              <label>LeetCode Username</label>
              <input
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
                placeholder="e.g. theprince09"
              />
            </div>

            <button className="settings-save-btn" onClick={saveIntegrations}>
              Save Integrations
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="settings-card">
          <h2>🔔 Notifications</h2>
          <p>Manage your notification preferences</p>

          <div className="notif-list">
            {[
              ["streak", "🔥 Daily Streak Reminder"],
              ["newCert", "🏆 New Certificate Added"],
              ["weeklyReport", "📊 Weekly Progress Report"],
              ["projectReminder", "🗂️ Project Update Reminder"],
            ].map(([key, label]) => (
              <div className="notif-row" key={key}>
                <span>{label}</span>
                <div
                  className={`toggle-switch ${notif[key] ? "on" : ""}`}
                  onClick={() =>
                    setNotif({ ...notif, [key]: !notif[key] })
                  }
                >
                  <div className="toggle-knob" />
                </div>
              </div>
            ))}
          </div>

          <button className="settings-save-btn" onClick={saveNotifications}>
            Save Notifications
          </button>
        </div>

        {/* DANGER ZONE */}
        <div className="settings-card danger-card">
          <h2>⚠️ Danger Zone</h2>
          <p>These actions are irreversible</p>

          <button className="danger-btn" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;