import { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiClock, FiRefreshCw, FiSearch, FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";
import adminService from "../../services/adminService";
import { formatDateTime } from "../../utils/formatDate";

const PAGE_SIZE = 20;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminService.getUsers({ page, limit: PAGE_SIZE, ...(search && { search }), ...(status && { status }) });
      const nextUsers = Array.isArray(response?.data) ? response.data : [];
      setUsers(nextUsers);
      setSummary(response?.summary || {});
      setTotalRecords(Number(response?.totalRecords || nextUsers.length));
      setTotalPages(Math.max(1, Number(response?.totalPages || 1)));
    } catch (requestError) {
      setError(requestError.message || "Unable to load user activity.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    Promise.resolve().then(loadUsers);
  }, [loadUsers]);

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const cards = [
    ["totalUsers", "Total users", FiUsers],
    ["activeUsers", "Active accounts", FiUserCheck],
    ["recentLogins", "Active in 7 days", FiClock],
    ["inactiveUsers", "Inactive accounts", FiUserX],
  ];

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div><p className="eyebrow">Users</p><h2>User activity</h2><p className="subheading-text">Review account status, departments, and recent login activity.</p></div>
        <button className="icon-button labeled" type="button" onClick={loadUsers} disabled={isLoading}><FiRefreshCw /> Refresh</button>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="metric-grid">
        {cards.map(([key, label, Icon]) => <article className="metric-card" key={key}><Icon /><span>{label}</span><strong>{Number(summary[key] || 0)}</strong></article>)}
      </div>
      <div className="panel admin-list-toolbar">
        <form className="search-box" onSubmit={applySearch}><FiSearch /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search users" /></form>
        <label className="compact-field status-filter"><span>Account status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="banned">Banned</option></select></label>
      </div>
      {isLoading ? <div className="panel muted-panel">Loading users...</div> : !users.length ? <div className="panel muted-panel">No users match this view.</div> : <div className="table-wrap"><table className="data-table admin-users-table"><thead><tr><th>User</th><th>Email</th><th>Department</th><th>Status</th><th>Last login</th><th>Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.full_name || user.username}</strong><small>@{user.username}</small></td><td>{user.email}</td><td>{user.department || "-"}</td><td><span className={`status-badge status-${user.status || "inactive"}`}>{user.status || "inactive"}</span></td><td>{formatDateTime(user.last_login) || "Never"}</td><td>{formatDateTime(user.created_at) || "-"}</td></tr>)}</tbody></table></div>}
      <div className="pagination-row"><button className="icon-button labeled" type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}><FiChevronLeft /> Previous</button><span>{totalRecords} users · Page {page} of {totalPages}</span><button className="icon-button labeled" type="button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>Next <FiChevronRight /></button></div>
    </section>
  );
};

export default Users;
