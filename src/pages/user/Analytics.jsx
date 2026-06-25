import { useEffect, useState } from "react";
import { FiDatabase, FiEye, FiSearch, FiShield, FiUsers } from "react-icons/fi";
import analyticsService from "../../services/analyticsService";

const cards = [
  ["totalUsers", "Users", FiUsers],
  ["totalAdmins", "Admins", FiShield],
  ["totalTables", "Tables", FiDatabase],
  ["totalViews", "Views", FiEye],
  ["totalSearches", "Searches", FiSearch],
];

const Analytics = () => {
  const [overview, setOverview] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    analyticsService.getOverview().then(setOverview).catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Cached platform overview</h2>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="metric-grid">
        {cards.map(([key, label, Icon]) => (
          <article className="metric-card" key={key}>
            <Icon />
            <span>{label}</span>
            <strong>{overview[key] ?? "-"}</strong>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Analytics;
