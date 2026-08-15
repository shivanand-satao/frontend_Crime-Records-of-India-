import { useEffect, useMemo, useState } from "react";
import { FiClock, FiDatabase, FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getActivityLog, clearActivityLog } from "../../utils/activityLog";
import { formatDateTime } from "../../utils/formatDate";

const iconMap = {
  "dataset-view": FiDatabase,
  search: FiSearch,
  filter: FiFilter,
};

const History = () => {
  const [entries, setEntries] = useState([]);

  const refreshEntries = () => setEntries(getActivityLog());

  useEffect(() => {
    refreshEntries();

    const handleStorage = (event) => {
      if (event.key === "crime_records_activity_log") {
        refreshEntries();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const summary = useMemo(() => {
    const datasetViews = entries.filter((entry) => entry.type === "dataset-view").length;
    const searches = entries.filter((entry) => String(entry.subtitle || "").toLowerCase().includes("search")).length;
    const filters = entries.filter((entry) => String(entry.subtitle || "").includes("=")).length;

    return { datasetViews, searches, filters };
  }, [entries]);

  const handleClear = () => {
    clearActivityLog();
    refreshEntries();
  };

  return (
    <section className="page-stack">
      <div className="page-heading dashboard-subhead">
        <div>
          <p className="eyebrow">History</p>
          <h2>Recent activity</h2>
          <p className="subheading-text">Your recent dataset views, searches, and filters are tracked locally in this session.</p>
        </div>
        <div className="button-row">
          <button className="secondary-link history-action" type="button" onClick={refreshEntries}>
            <FiRefreshCw /> Refresh
          </button>
          <button className="danger-action history-action" type="button" onClick={handleClear} disabled={!entries.length}>
            Clear history
          </button>
        </div>
      </div>

      <div className="metric-grid history-summary-grid">
        <article className="metric-card metric-card-accent">
          <FiClock />
          <span>Actions</span>
          <strong>{entries.length}</strong>
        </article>
        <article className="metric-card metric-card-accent">
          <FiDatabase />
          <span>Dataset views</span>
          <strong>{summary.datasetViews}</strong>
        </article>
        <article className="metric-card metric-card-accent">
          <FiSearch />
          <span>Searches</span>
          <strong>{summary.searches}</strong>
        </article>
        <article className="metric-card metric-card-accent">
          <FiFilter />
          <span>Column filters</span>
          <strong>{summary.filters}</strong>
        </article>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Timeline</p>
            <h3>What you opened most recently</h3>
          </div>
        </div>

        {entries.length ? (
          <div className="activity-timeline">
            {entries.map((entry) => {
              const Icon = iconMap[entry.type] || FiClock;

              return (
                <article className="activity-item" key={entry.id}>
                  <div className="activity-icon">
                    <Icon />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title-row">
                      <h4>{entry.title}</h4>
                      <time>{formatDateTime(entry.timestamp)}</time>
                    </div>
                    <p>{entry.subtitle}</p>
                    <span>{String(entry.table || "").replaceAll("_", " ")}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state history-empty">
            <h3>No activity yet</h3>
            <p>Open a dataset, click a value, or apply a filter to populate your history.</p>
            <Link className="primary-link" to="/dashboard/datasets">Browse datasets</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default History;
