import { useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = ({ githubStats, profileName, githubUser, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="dp-sidebar">
      <div className="dp-logo">devProgress</div>

      <nav className="dp-nav">
        <a
          className={location.pathname === "/after-login" ? "active" : ""}
          onClick={() => navigate("/after-login")}
        >
          Dashboard
        </a>

        <a
          className={location.pathname === "/projects" ? "active" : ""}
          onClick={() => navigate("/projects")}
        >
          Projects
        </a>

        <a
          className={location.pathname === "/certificates" ? "active" : ""}
          onClick={() => navigate("/certificates")}
        >
          Certificates
        </a>

        <a
          className={location.pathname === "/growth" ? "active" : ""}
          onClick={() => navigate("/growth")}
        >
          Growth
        </a>
      </nav>

      {/* Career Progress */}
      <div className="frm-btm">
        <div className="dp-progress-box">
          <div className="dp-ring">
            <svg>
              <circle cx="45" cy="45" r="40"></circle>
              <circle cx="45" cy="45" r="40" className="progress"></circle>
            </svg>

            <span>80%</span>
          </div>

          <p>Career Progress</p>
        </div>

        {/* User */}

        <div className="dp-user-mini">
          {githubStats?.avatar_url ? (
            <img src={githubStats.avatar_url} className="avatar" />
          ) : (
            <div className="avatar"></div>
          )}

          <div className="Profile-name">
            <h4>{profileName}</h4>
            <p>{githubUser}</p>
          </div>
        </div>
      </div>
      <button className="dp-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
