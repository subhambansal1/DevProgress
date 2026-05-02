import "../styles/dashboard.css";
import JourneyGraph from "../components/JourneyGraph";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Left Section */}
      <div className="dashboard-left glass">
        <h1>
          Welcome dear <span className="highlight">Aspirant</span> 👋
        </h1>
        <p className="subtitle">
          Let’s build your dreams, one line of code at a time.
        </p>

        <p className="quote">
          “Success is the sum of small efforts, repeated day in and day out.”
        </p>

        <button className="primary-btn">Get Started</button>
      </div>

      {/* Right Section */}
      <div className="dashboard-right glass">
        <h2>The Reality of the Journey</h2>
        <p className="subtitle">Progress isn’t always linear</p>

        <div className="graph-container">
          <div className="graph-placeholder">
            <JourneyGraph />
          </div>

          <div className="graph-labels">
            <span>Setbacks</span>
            <span>Doubt</span>
            <span>Resilience</span>
            <span className="breakthrough">Breakthrough 🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
