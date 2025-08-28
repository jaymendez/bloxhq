import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/Stats.css";

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/stats");
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up polling to refresh stats periodically
    const intervalId = setInterval(fetchStats, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="stats-container">
        <h1>Item Statistics</h1>
        <div className="stats-loading">
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <h1>Item Statistics</h1>
        <div className="stats-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>Item Statistics</h1>
        <button
          className="stats-refresh-button"
          onClick={fetchStats}
          disabled={loading}
          aria-label="Refresh statistics"
        >
          Refresh
        </button>
      </div>

      <div className="stats-card">
        <div className="stats-item">
          <div className="stats-label">Total Items</div>
          <div className="stats-value">{stats.total}</div>
        </div>

        <div className="stats-item">
          <div className="stats-label">Average Price</div>
          <div className="stats-value">
            ${stats.averagePrice ? stats.averagePrice.toFixed(2) : "0.00"}
          </div>
        </div>

        {stats.lastUpdated && (
          <div className="stats-footer">
            Last updated: {formatDate(stats.lastUpdated)}
          </div>
        )}
      </div>

      <div className="stats-link-container">
        <Link to="/" className="stats-back-link">
          Back to Items
        </Link>
      </div>
    </div>
  );
}

export default Stats;
