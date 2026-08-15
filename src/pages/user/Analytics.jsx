import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiDatabase, FiEye, FiSearch, FiShield, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import analyticsService from "../../services/analyticsService";

const cards = [
  ["totalUsers", "Users", FiUsers],
  ["totalAdmins", "Admins", FiShield],
  ["totalTables", "Tables", FiDatabase],
  ["totalViews", "Views", FiEye],
  ["totalSearches", "Searches", FiSearch],
];

const Analytics = ({ isAdmin = false }) => {
  const [overview, setOverview] = useState({});
  const [error, setError] = useState("");
  const historyPath = isAdmin ? "/admin/search-logs" : "/dashboard/history";
  const datasetsPath = isAdmin ? "/admin/datasets" : "/dashboard/datasets";

  const signalRows = useMemo(() => {
    const totalUsers = Number(overview.totalUsers || 0);
    const totalTables = Number(overview.totalTables || 0);
    const totalViews = Number(overview.totalViews || 0);
    const totalSearches = Number(overview.totalSearches || 0);

    const maxValue = Math.max(totalUsers, totalTables, totalViews, totalSearches, 1);

    return [
      { label: "Users", value: totalUsers, width: (totalUsers / maxValue) * 100 },
      { label: "Tables", value: totalTables, width: (totalTables / maxValue) * 100 },
      { label: "Views", value: totalViews, width: (totalViews / maxValue) * 100 },
      { label: "Searches", value: totalSearches, width: (totalSearches / maxValue) * 100 },
    ];
  }, [overview]);

  useEffect(() => {
    analyticsService.getOverview().then(setOverview).catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <section className="page-stack">
      <div className="analytics-hero panel">
        <div className="analytics-hero-copy">
          <p className="eyebrow">Analytics</p>
          <h2>Platform activity at a glance</h2>
          <p className="subheading-text">Use this view to see whether the platform is being searched, explored, or viewed more heavily right now.</p>
          <div className="dashboard-actions">
            <Link className="primary-link" to={historyPath}>
              {isAdmin ? "Open search logs" : "Open history"}
              <FiArrowRight />
            </Link>
            <Link className="secondary-link" to={datasetsPath}>
              Explore datasets
            </Link>
          </div>
        </div>
        <div className="analytics-hero-panel">
          <span className="hero-kicker">Overview</span>
          <strong>{overview.totalViews ?? 0}</strong>
          <p>Total views across the current dataset layer</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="metric-grid analytics-metric-grid">
        {cards.map(([key, label, Icon]) => (
          <article className="metric-card" key={key}>
            <Icon />
            <span>{label}</span>
            <strong>{overview[key] ?? "-"}</strong>
          </article>
        ))}
      </div>
      <div className="analytics-grid">
        <div className="panel insight-panel">
          <div>
            <p className="eyebrow">Signal breakdown</p>
            <h3>Relative platform load</h3>
          </div>
          <div className="signal-list">
            {signalRows.map((row) => (
              <div className="signal-row" key={row.label}>
                <div className="signal-row-top">
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
                <div className="signal-bar"><i style={{ width: `${row.width}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel analytics-note-panel">
          <p className="eyebrow">What to inspect next</p>
          <h3>Move from summary to records</h3>
          <p className="muted-panel">Open datasets when you want table-level detail. Use {isAdmin ? "search logs when you want to review user queries and results." : "history when you want to review what you filtered and clicked most recently."}</p>
          <div className="spotlight-links analytics-links">
            <Link to={datasetsPath}>Dataset explorer</Link>
            <Link to={historyPath}>{isAdmin ? "Search activity" : "Session history"}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;
