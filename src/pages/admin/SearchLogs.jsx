import { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDatabase, FiRefreshCw, FiSearch, FiTrendingUp } from "react-icons/fi";
import adminService from "../../services/adminService";
import datasetService from "../../services/datasetService";
import { normalizeTableList } from "../../utils/datasetNormalization";
import { formatDateTime } from "../../utils/formatDate";

const PAGE_SIZE = 20;

const formatFilters = (filters) => {
  if (!filters || (typeof filters === "object" && !Object.keys(filters).length)) return "No filters";
  if (typeof filters === "string") return filters;
  return Object.entries(filters).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`).join(", ");
};

const SearchLogs = () => {
  const [logs, setLogs] = useState([]);
  const [tables, setTables] = useState([]);
  const [summary, setSummary] = useState({});
  const [tableName, setTableName] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [username, setUsername] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminService.getSearchLogs({ page, limit: PAGE_SIZE, ...(tableName && { tableName }), ...(username && { username }) });
      const nextLogs = Array.isArray(response?.data) ? response.data : [];
      setLogs(nextLogs);
      setSummary(response?.summary || {});
      setTotalRecords(Number(response?.totalRecords || nextLogs.length));
      setTotalPages(Math.max(1, Number(response?.totalPages || 1)));
    } catch (requestError) {
      setError(requestError.message || "Unable to load search activity.");
    } finally {
      setIsLoading(false);
    }
  }, [page, tableName, username]);

  useEffect(() => {
    datasetService.getTables().then((response) => setTables(normalizeTableList(response))).catch(() => setTables([]));
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadLogs);
  }, [loadLogs]);

  const applyUsername = (event) => {
    event.preventDefault();
    setPage(1);
    setUsername(usernameInput.trim());
  };

  const topKeyword = summary.mostSearchedKeyword?.keyword || "No keyword recorded";
  const topDataset = summary.topDatasets?.[0]?.dataset || "No dataset recorded";

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div><p className="eyebrow">Audit</p><h2>Search logs</h2><p className="subheading-text">See what users search for, which datasets are trending, and how many results were returned.</p></div>
        <button className="icon-button labeled" type="button" onClick={loadLogs} disabled={isLoading}><FiRefreshCw /> Refresh</button>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="platform-signal-grid">
        <article className="panel signal-summary"><FiSearch /><span>Total searches</span><strong>{totalRecords}</strong><small>recorded search requests</small></article>
        <article className="panel signal-summary"><FiTrendingUp /><span>Most searched keyword</span><strong className="signal-summary-name">{topKeyword}</strong><small>{summary.mostSearchedKeyword?.total ? `${summary.mostSearchedKeyword.total} searches` : "structured filter values"}</small></article>
        <article className="panel signal-summary"><FiDatabase /><span>Trending dataset</span><strong className="signal-summary-name">{String(topDataset).replaceAll("_", " ")}</strong><small>{summary.topDatasets?.[0]?.total ? `${summary.topDatasets[0].total} searches` : "based on search logs"}</small></article>
      </div>
      <div className="panel admin-list-toolbar">
        <form className="search-box" onSubmit={applyUsername}><FiSearch /><input value={usernameInput} onChange={(event) => setUsernameInput(event.target.value)} placeholder="Filter by username" /></form>
        <label className="compact-field status-filter"><span>Dataset</span><select value={tableName} onChange={(event) => { setTableName(event.target.value); setPage(1); }}><option value="">All datasets</option>{tables.map((table) => <option key={table} value={table}>{table.replaceAll("_", " ")}</option>)}</select></label>
      </div>
      {isLoading ? <div className="panel muted-panel">Loading search logs...</div> : !logs.length ? <div className="panel muted-panel">No search logs match this view.</div> : <div className="table-wrap"><table className="data-table search-log-table"><thead><tr><th>User</th><th>Dataset</th><th>Search filters</th><th>Results</th><th>Status</th><th>Created</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{log.username || `User #${log.user_id || "-"}`}</td><td>{String(log.table_name || "-").replaceAll("_", " ")}</td><td>{formatFilters(log.search_filters)}</td><td>{log.result_count ?? "-"}</td><td><span className={`status-badge status-${log.status || "success"}`}>{log.status || "success"}</span></td><td>{formatDateTime(log.created_at) || "-"}</td></tr>)}</tbody></table></div>}
      <div className="pagination-row"><button className="icon-button labeled" type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}><FiChevronLeft /> Previous</button><span>Page {page} of {totalPages}</span><button className="icon-button labeled" type="button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>Next <FiChevronRight /></button></div>
    </section>
  );
};

export default SearchLogs;
