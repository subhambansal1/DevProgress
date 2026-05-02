import "./Navbar.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { getProfile } from "../../utils/auth";

const PAGES = [
  { name: "Dashboard", path: "/after-login", icon: "🏠" },
  { name: "Growth", path: "/growth", icon: "📈" },
  { name: "Projects", path: "/projects", icon: "🗂" },
  { name: "Certificates", path: "/certificates", icon: "🏆" },
  { name: "Current Learning", path: "/current-learning", icon: "📚" },
  { name: "Profile", path: "/profile", icon: "👤" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
  { name: "Resume Builder", path: "/resume", icon: "📄" },
  { name: "Interview Prep", path: "/interview", icon: "🎯" },
];

const Navbar = ({ theme, setTheme }) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);

  // Load profile + GitHub avatar
  // Load profile + GitHub avatar
useEffect(() => {
  const loadNavProfile = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAvatar(null);
      setProfileName("");
      setNotifications([]);
      return;
    }

    getProfile().then((prof) => {
      if (!prof) return;
      setProfileName(prof.name || "Developer");

      if (prof.github) {
        fetch(`https://api.github.com/users/${prof.github}`)
          .then((r) => r.json())
          .then((data) => { if (data.avatar_url) setAvatar(data.avatar_url); });
      } else if (prof.avatar) {
        setAvatar(prof.avatar);
      } else {
        setAvatar(null);
      }

      const notifs = [];
      if (!prof.github) notifs.push({ id: 1, msg: "Add GitHub username in Profile", icon: "🐙", time: "now" });
      if (!prof.leetcode) notifs.push({ id: 2, msg: "Add LeetCode username in Profile", icon: "⚡", time: "now" });
      if (prof.skills?.length === 0) notifs.push({ id: 3, msg: "Add your skills in Profile", icon: "🛠️", time: "now" });
      notifs.push({ id: 4, msg: "Keep your streak going! 🔥", icon: "🔥", time: "Today" });
      notifs.push({ id: 5, msg: "New Interview questions added!", icon: "🎯", time: "1h ago" });
      setNotifications(notifs);
    }).catch(() => {});
  };

  loadNavProfile();

  window.addEventListener("profileUpdated", loadNavProfile);
  window.addEventListener("storage", loadNavProfile);

  return () => {
    window.removeEventListener("profileUpdated", loadNavProfile);
    window.removeEventListener("storage", loadNavProfile);
  };
}, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchOpen(false); setQuery(""); setResults([]); }
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cmd+K
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }
      if (e.key === "Escape") { setSearchOpen(false); setQuery(""); setResults([]); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const found = [];

    PAGES.forEach((page) => {
      if (page.name.toLowerCase().includes(q.toLowerCase()))
        found.push({ type: "page", icon: page.icon, name: page.name, path: page.path });
    });

    try {
      const email = localStorage.getItem("email");
      if (email) {
        const res = await fetch(`http://localhost:5000/api/certificate/${email}`);
        const certs = await res.json();
        certs.forEach((cert) => {
          if (cert.title?.toLowerCase().includes(q.toLowerCase()) || cert.issuer?.toLowerCase().includes(q.toLowerCase()))
            found.push({ type: "certificate", icon: "🏆", name: cert.title, sub: cert.issuer, path: "/certificates" });
        });
      }
    } catch {}

    try {
      const github = localStorage.getItem("github");
      if (github) {
        const res = await fetch(`https://api.github.com/users/${github}/repos?per_page=100`);
        const repos = await res.json();
        if (Array.isArray(repos)) {
          repos.forEach((repo) => {
            if (repo.name?.toLowerCase().includes(q.toLowerCase()))
              found.push({ type: "project", icon: "📁", name: repo.name, sub: repo.language || "Code", path: "/projects", url: repo.html_url });
          });
        }
      }
    } catch {}

    setResults(found.slice(0, 8));
  };

  const handleSelect = (result) => {
    if (result.url) window.open(result.url, "_blank");
    else navigate(result.path);
    setSearchOpen(false); setQuery(""); setResults([]);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    window.dispatchEvent(new Event("themeChange"));
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <nav className="pro-navbar">
        {/* Logo */}
        <div className="nav-left" onClick={() => navigate("/after-login")} style={{ cursor: "pointer" }}>
          <div className="nav-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v18h18" stroke="#ff2d2d" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M7 16l4-4 4 4 4-6" stroke="#ff2d2d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">DevProgress</span>
        </div>

        {/* Nav Links */}
        <ul className={`nav-links ${open ? "show" : ""}`}>
          <li><NavLink to="/after-login">Dashboard</NavLink></li>
          <li><NavLink to="/growth">Growth</NavLink></li>
          <li><NavLink to="/projects">Projects</NavLink></li>
          <li><NavLink to="/certificates">Certificates</NavLink></li>
          <li><NavLink to="/current-learning">📚 Learning</NavLink></li>
          <li className="nav-resume-link"><NavLink to="/resume">📄 Resume</NavLink></li>
        </ul>

        {/* Right */}
        <div className="nav-right">

          {/* Search */}
          <div className="nav-search" ref={searchRef}>
            <div className="search-trigger" onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="search-placeholder">Search...</span>
              <span className="search-shortcut">⌘K</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notifications */}
          <div className="notif-wrapper" ref={notifRef}>
            <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  <span className="notif-clear" onClick={() => setNotifications([])}>Clear all</span>
                </div>
                {notifications.length > 0 ? notifications.map((n) => (
                  <div key={n.id} className="notif-item">
                    <span className="notif-item-icon">{n.icon}</span>
                    <div>
                      <p>{n.msg}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                )) : (
                  <div className="notif-empty">All caught up! 🎉</div>
                )}
                <div className="notif-footer">
                  <a href="/notifications">View all notifications →</a>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="profile-wrapper" ref={dropdownRef}>
            <div className="profile-avatar-btn" onClick={() => setProfileOpen(!profileOpen)}>
              {avatar ? (
                <img src={avatar} alt="profile" className="profile-icon" />
              ) : (
                <div className="profile-icon profile-placeholder">
                  {profileName?.charAt(0)?.toUpperCase() || "D"}
                </div>
              )}
              <div className="profile-status-dot" />
            </div>

            <div className={`profile-dropdown ${profileOpen ? "open" : ""}`}>
              <div className="dropdown-user-info">
                {avatar ? <img src={avatar} className="dropdown-avatar" /> : <div className="dropdown-avatar-placeholder">{profileName?.charAt(0) || "D"}</div>}
                <div>
                  <p className="dropdown-name">{profileName}</p>
                  <p className="dropdown-email">{localStorage.getItem("email") || ""}</p>
                </div>
              </div>

              <div className="career-score-section">
                <div className="score-left">
                  <span className="score-label">Career Progress</span>
                  <span className="score-value">72%</span>
                </div>
                <svg className="score-pie" viewBox="0 0 36 36" style={{
                  background: `conic-gradient(#ff2d2d 0deg ${72*3.6}deg, rgba(255,255,255,0.1) ${72*3.6}deg)`,
                  borderRadius: '50%'
                }}>
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                </svg>
              </div>

              <div className="dropdown-divider" />

              <p className="dropdown-item" onClick={() => { navigate("/profile"); setProfileOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </p>
              <p className="dropdown-item" onClick={() => { navigate("/settings"); setProfileOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </p>
              <p className="dropdown-item" onClick={() => { navigate("/resume"); setProfileOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Resume Builder
              </p>
              <p className="dropdown-item" onClick={() => { navigate("/interview"); setProfileOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Interview Prep
              </p>

              <div className="dropdown-divider" />

              <div className="dropdown-theme-toggle">
                <span>{theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
                <button className="toggle-switch" onClick={toggleTheme}>
                  <div className={`toggle-slider ${theme}`}></div>
                </button>
              </div>

              <div className="dropdown-divider" />

              <p className="dropdown-item dropdown-logout" onClick={logout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </p>
            </div>
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setOpen(!open)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-modal" ref={searchRef}>
            <div className="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input ref={searchInputRef} type="text" placeholder="Search pages, projects, certificates..." value={query} onChange={(e) => handleSearch(e.target.value)} autoFocus />
              <span className="search-esc" onClick={() => { setSearchOpen(false); setQuery(""); setResults([]); }}>ESC</span>
            </div>
            <div className="search-results">
              {results.length > 0 ? (
                results.map((r, i) => (
                  <div key={i} className="search-result-item" onClick={() => handleSelect(r)}>
                    <span className="result-icon">{r.icon}</span>
                    <div className="result-text">
                      <span className="result-name">{r.name}</span>
                      {r.sub && <span className="result-sub">{r.sub}</span>}
                    </div>
                    <span className="result-type">{r.type}</span>
                  </div>
                ))
              ) : query ? (
                <div className="search-empty">No results for "{query}"</div>
              ) : (
                <div className="search-hints">
                  {PAGES.map((p) => (
                    <div key={p.path} className="search-result-item" onClick={() => handleSelect(p)}>
                      <span className="result-icon">{p.icon}</span>
                      <span className="result-name">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;