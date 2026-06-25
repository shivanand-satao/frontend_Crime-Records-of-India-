import { useEffect, useState } from "react";
import { FiBarChart2, FiDatabase, FiEye, FiSearch, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import analyticsService from "../../services/analyticsService";
import datasetService from "../../services/datasetService";

const statConfig = [
    { key: "totalUsers", label: "Users", icon: FiUsers },
    { key: "totalTables", label: "Datasets", icon: FiDatabase },
    { key: "totalViews", label: "Views", icon: FiEye },
    { key: "totalSearches", label: "Searches", icon: FiSearch },
];

const Dashboard = () => {
    const [overview, setOverview] = useState({});
    const [tables, setTables] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([analyticsService.getOverview(), datasetService.getTables()])
            .then(([overviewResponse, tableResponse]) => {
                setOverview(overviewResponse);
                setTables(tableResponse.tables || tableResponse.data || tableResponse || []);
            })
            .catch((requestError) => setError(requestError.message));
    }, []);

    return (
        <section className="page-stack">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Overview</p>
                    <h2>National crime data workspace</h2>
                </div>
                <Link className="primary-link" to="/dashboard/datasets">Browse datasets</Link>
            </div>
            {error && <div className="alert">{error}</div>}
            <div className="metric-grid">
                {statConfig.map(({ key, label, icon: Icon }) => (
                    <article className="metric-card" key={key}>
                        <Icon />
                        <span>{label}</span>
                        <strong>{overview[key] ?? "-"}</strong>
                    </article>
                ))}
            </div>
            <div className="panel">
                <div className="panel-heading">
                    <h3>Available datasets</h3>
                    <FiBarChart2 />
                </div>
                <div className="dataset-list">
                    {tables.slice(0, 8).map((table) => (
                        <Link to={`/dashboard/datasets/${table}`} key={table}>{String(table).replaceAll("_", " ")}</Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
