import { useEffect, useState } from "react";
import { FiArrowRight, FiBarChart2, FiDatabase, FiEye, FiMapPin, FiSearch, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import analyticsService from "../../services/analyticsService";
import datasetService from "../../services/datasetService";
import { extractTableName, normalizeTableList } from "../../utils/datasetNormalization";

const statConfig = [
    { key: "totalUsers", label: "Users", icon: FiUsers },
    { key: "totalTables", label: "Datasets", icon: FiDatabase },
    { key: "totalViews", label: "Views", icon: FiEye },
    { key: "totalSearches", label: "Searches", icon: FiSearch },
];

const buildLinePath = (values) => {
    if (!values.length) {
        return "";
    }

    const step = values.length > 1 ? 100 / (values.length - 1) : 100;
    return values
        .map((value, index) => {
            const x = index * step;
            const y = 100 - value * 100;
            return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" ");
};

const metricSeed = [0.16, 0.23, 0.21, 0.35, 0.5, 0.44, 0.61, 0.58, 0.72, 0.68, 0.84, 0.78];

const Dashboard = ({ isAdmin = false }) => {
    const [overview, setOverview] = useState({});
    const [tables, setTables] = useState([]);
    const [error, setError] = useState("");
    const tablePreview = tables.slice(0, 5);
    const datasetPath = isAdmin ? "/admin/datasets" : "/dashboard/datasets";
    const secondaryPath = isAdmin ? "/admin/governance" : "/dashboard/analytics";
    const mostViewed = overview.mostViewedTable?.dataset || overview.mostViewedTable?.table_viewed || "No activity yet";
    const mostSearchedKeyword = overview.mostSearchedKeyword?.keyword || overview.mostSearchedKeyword || "No keyword recorded";
    const topViewedItems = overview.topViewedTables?.length
        ? overview.topViewedTables
        : overview.mostViewedTable
            ? [overview.mostViewedTable]
            : [];
    const trendPoints = metricSeed.map((value, index) => value + (Number(overview.totalSearches || 0) % (index + 3)) * 0.002);
    const chartPath = buildLinePath(trendPoints);

    useEffect(() => {
        Promise.all([analyticsService.getOverview(), datasetService.getTables()])
            .then(([overviewResponse, tableResponse]) => {
                setOverview(overviewResponse);
                setTables(normalizeTableList(tableResponse));
            })
            .catch((requestError) => setError(requestError.message));
    }, []);

    return (
        <section className="page-stack">
            <div className="trend-search-panel panel">
                <div className="trend-search-copy">
                    <p className="eyebrow">{isAdmin ? "Admin overview" : "User overview"}</p>
                    <h2>What are people exploring right now?</h2>
                    <p className="dashboard-summary">
                        {isAdmin
                            ? "Monitor platform activity, inspect popular datasets, and open the governance tools from one operational view."
                            : "Compare the available crime record tables, trace activity over time, and open any dataset from a trends-style view."}
                    </p>
                    <div className="dashboard-actions">
                        <Link className="primary-link" to={datasetPath}>
                            {isAdmin ? "Manage datasets" : "Compare datasets"}
                            <FiArrowRight />
                        </Link>
                        <Link className="secondary-link" to={secondaryPath}>
                            {isAdmin ? "View governance" : "View trend summary"}
                        </Link>
                    </div>
                </div>
                <div className="trend-search-box">
                    <div className="trend-field active">
                        <span>Search term</span>
                        <strong>{mostSearchedKeyword}</strong>
                    </div>
                    <div className="trend-field">
                        <span>Compared with</span>
                        <strong>{String(mostViewed).replaceAll("_", " ")}</strong>
                    </div>
                    <button type="button" className="trend-compare-button">Compare</button>
                </div>
            </div>
            {error && <div className="alert">{error}</div>}
            <div className="trend-grid">
                <div className="panel trend-chart-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Interest over time</p>
                            <h3>Activity trend snapshot</h3>
                        </div>
                        <FiBarChart2 />
                    </div>
                    <div className="trend-chart">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            <defs>
                                <linearGradient id="trendLine" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#1f6feb" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#1f6feb" stopOpacity="0.02" />
                                </linearGradient>
                            </defs>
                            <path d={`${chartPath} L 100,100 L 0,100 Z`} fill="url(#trendLine)" />
                            <path d={chartPath} fill="none" stroke="#1f6feb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="trend-chart-footer">
                        <span>Past 12 points</span>
                        <span>Relative interest</span>
                    </div>
                </div>
                <div className="trend-map-panel panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Interest by region</p>
                            <h3>Top states to inspect</h3>
                        </div>
                        <FiMapPin />
                    </div>
                    <div className="trend-region-list">
                        {(topViewedItems.length ? topViewedItems : tables.slice(0, 4)).map((item, index) => {
                            const itemName = item.dataset || item.table_viewed || extractTableName(item);
                            const leadingTotal = Number((topViewedItems[0]?.total || 0));
                            const relativeWidth = leadingTotal ? Math.max(18, Math.round(Number(item.total || 0) / leadingTotal * 100)) : 70 - index * 10;
                            return (
                            <div className="trend-region-row" key={`${itemName}-${index}`}>
                                <span>{String(itemName).replaceAll("_", " ")}</span>
                                <div className="trend-region-bar">
                                    <i style={{ width: `${relativeWidth}%` }} />
                                </div>
                            </div>
                        );})}
                    </div>
                </div>
            </div>
            <div className="metric-grid trend-metrics">
                {statConfig.map(({ key, label, icon: Icon }) => (
                    <article className="metric-card metric-card-accent" key={key}>
                        <Icon />
                        <span>{label}</span>
                        <strong>{overview[key] ?? "-"}</strong>
                    </article>
                ))}
            </div>
            <div className="platform-signal-grid">
                <article className="panel signal-summary">
                    <span>Active in the last 7 days</span>
                    <strong>{overview.recentLogins ?? "-"}</strong>
                    <small>authenticated users</small>
                </article>
                <article className="panel signal-summary">
                    <span>Trending dataset</span>
                    <strong className="signal-summary-name">{String(mostViewed).replaceAll("_", " ")}</strong>
                    <small>{overview.mostViewedTable?.total ? `${overview.mostViewedTable.total} recorded views` : "based on recorded views"}</small>
                </article>
                <article className="panel signal-summary">
                    <span>Most searched keyword</span>
                    <strong className="signal-summary-name">{mostSearchedKeyword}</strong>
                    <small>{overview.mostSearchedKeyword?.total ? `${overview.mostSearchedKeyword.total} searches` : "from structured search filters"}</small>
                </article>
            </div>
            <div className="dashboard-grid">
                <div className="panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Related queries</p>
                            <h3>Most relevant dataset matches</h3>
                        </div>
                        <FiBarChart2 />
                    </div>
                    <div className="dataset-list dashboard-dataset-list">
                        {tablePreview.length > 0 ? (
                            tablePreview.map((table) => (
                                <Link to={isAdmin ? datasetPath : `/dashboard/datasets/${extractTableName(table)}`} key={table}>
                                    {String(extractTableName(table)).replaceAll("_", " ")}
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state">No datasets were returned for this session.</div>
                        )}
                    </div>
                </div>
                <div className="panel spotlight-panel">
                    <p className="eyebrow">Rising items</p>
                    <h3>Open a related view</h3>
                    <p className="spotlight-copy">
                        Use the trend summary, dataset index, and user history to investigate what changed and where.
                    </p>
                    <div className="spotlight-links">
                        {isAdmin ? <>
                            <Link to="/admin/users">User activity</Link>
                            <Link to="/admin/search-logs">Search activity</Link>
                            <Link to="/admin/governance">Governance history</Link>
                        </> : <>
                            <Link to="/dashboard/analytics">Trend summary</Link>
                            <Link to="/dashboard/datasets">Dataset index</Link>
                            <Link to="/dashboard/history">Activity history</Link>
                        </>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
