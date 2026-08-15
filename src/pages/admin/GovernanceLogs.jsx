import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw, FiX } from "react-icons/fi";
import GovernanceTable from "../../components/admin/GovernanceTable";
import adminService from "../../services/adminService";
import datasetService from "../../services/datasetService";
import { getAuditId } from "../../utils/auditLog";
import { normalizeTableList } from "../../utils/datasetNormalization";
import { formatDateTime } from "../../utils/formatDate";

const PAGE_SIZE = 20;
const emptyFilters = { tableName: "", action: "", from: "", to: "" };

const pick = (record, keys, fallback = "") => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) return record[key];
  }
  return fallback;
};

const normalizeLogs = (response) => {
  const direct = response?.logs || response?.auditLogs || response?.records || response?.items;
  if (Array.isArray(direct)) return direct;
  if (Array.isArray(response?.data)) return response.data;
  if (response?.data && typeof response.data === "object") {
    return response.data.logs || response.data.auditLogs || response.data.records || response.data.items || [];
  }
  return Array.isArray(response) ? response : [];
};

const parseJsonValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const JsonSnapshot = ({ label, value }) => {
  const parsed = parseJsonValue(value);
  return <div className="snapshot-block"><strong>{label}</strong>{parsed === null ? <span className="muted-panel">Not recorded</span> : <pre>{typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2)}</pre>}</div>;
};

const GovernanceLogs = () => {
  const [tables, setTables] = useState([]);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const activeFilterCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = { page, limit: PAGE_SIZE };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const response = await adminService.getAuditLogs(params);
      const nextLogs = normalizeLogs(response);
      const pagination = response?.pagination || response?.data?.pagination || {};
      const nextTotal = Number(response?.totalRecords || response?.total || pagination.totalRecords || pagination.total || nextLogs.length);
      setLogs(nextLogs);
      setTotalRecords(nextTotal);
      setTotalPages(Math.max(1, Number(response?.totalPages || pagination.totalPages || Math.ceil(nextTotal / PAGE_SIZE) || 1)));
    } catch (requestError) {
      setError(requestError.message || "Unable to load governance audit logs.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    datasetService.getTables().then((response) => setTables(normalizeTableList(response))).catch(() => setTables([]));
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadLogs);
  }, [loadLogs]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setSelectedId("");
    setDetail(null);
    setFilters(draftFilters);
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  };

  const openDetail = async (record) => {
    const id = getAuditId(record);
    setSelectedId(id);
    setDetail(record);
    if (!id) return;
    setIsLoadingDetail(true);
    setError("");
    try {
      const response = await adminService.getAuditLog(id);
      setDetail(response?.auditLog || response?.log || response?.data || response);
    } catch (requestError) {
      setError(requestError.message || "Unable to load the complete audit record.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div><p className="eyebrow">Audit</p><h2>Governance logs</h2><p className="subheading-text">Review every administrator update and deletion recorded by the governance API.</p></div>
        <button className="icon-button labeled" type="button" onClick={loadLogs} disabled={isLoading}><FiRefreshCw /> Refresh</button>
      </div>
      {error && <div className="alert">{error}</div>}
      <form className="panel audit-filter-bar" onSubmit={applyFilters}>
        <label><span>Dataset</span><select value={draftFilters.tableName} onChange={(event) => setDraftFilters((current) => ({ ...current, tableName: event.target.value }))}><option value="">All datasets</option>{tables.map((table) => <option key={table} value={table}>{table.replaceAll("_", " ")}</option>)}</select></label>
        <label><span>Action</span><select value={draftFilters.action} onChange={(event) => setDraftFilters((current) => ({ ...current, action: event.target.value }))}><option value="">All actions</option><option value="UPDATE">Update</option><option value="DELETE">Delete</option><option value="INSERT">Insert</option></select></label>
        <label><span>From</span><input type="date" value={draftFilters.from} onChange={(event) => setDraftFilters((current) => ({ ...current, from: event.target.value }))} /></label>
        <label><span>To</span><input type="date" value={draftFilters.to} onChange={(event) => setDraftFilters((current) => ({ ...current, to: event.target.value }))} /></label>
        <div className="audit-filter-actions"><button className="primary-action" type="submit"><FiFilter /> Apply{activeFilterCount ? ` (${activeFilterCount})` : ""}</button><button className="icon-button" type="button" onClick={clearFilters} title="Clear filters"><FiX /></button></div>
      </form>
      <div className={detail ? "audit-layout has-detail" : "audit-layout"}>
        <div className="audit-list-stack">
          <div className="panel-heading"><span>{totalRecords} audit record{totalRecords === 1 ? "" : "s"}</span></div>
          <GovernanceTable logs={logs} isLoading={isLoading} selectedId={selectedId} onSelect={openDetail} />
          <div className="pagination-row"><button className="icon-button labeled" type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}><FiChevronLeft /> Previous</button><span>Page {page} of {totalPages}</span><button className="icon-button labeled" type="button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>Next <FiChevronRight /></button></div>
        </div>
        {detail && <aside className="panel audit-detail">
          <div className="panel-heading"><div><p className="eyebrow">Audit detail</p><h3>Record #{getAuditId(detail) || selectedId}</h3></div><button className="icon-button" type="button" onClick={() => { setDetail(null); setSelectedId(""); }} title="Close audit details"><FiX /></button></div>
          {isLoadingDetail ? <div className="muted-panel">Loading complete record...</div> : <>
            <dl className="audit-metadata">
              <div><dt>Action</dt><dd>{pick(detail, ["action", "action_type", "type"], "-")}</dd></div>
              <div><dt>Dataset</dt><dd>{String(pick(detail, ["tableName", "table_name", "table"], "-")).replaceAll("_", " ")}</dd></div>
              <div><dt>Administrator</dt><dd>{pick(detail, ["adminUsername", "admin_username", "username", "admin_name"], `Admin #${pick(detail, ["adminId", "admin_id"], "-")}`)}</dd></div>
              <div><dt>IP address</dt><dd>{pick(detail, ["ipAddress", "ip_address", "ip"], "-")}</dd></div>
              <div><dt>Created</dt><dd>{formatDateTime(pick(detail, ["createdAt", "created_at", "timestamp"], "")) || "-"}</dd></div>
            </dl>
            <JsonSnapshot label="Row identifier" value={pick(detail, ["rowIdentifier", "row_identifier", "row", "conditions"], null)} />
            <JsonSnapshot label="Old snapshot" value={pick(detail, ["oldData", "old_data", "oldValues", "old_values", "old_snapshot"], null)} />
            <JsonSnapshot label="New snapshot" value={pick(detail, ["newData", "new_data", "newValues", "new_values", "new_snapshot"], null)} />
            <JsonSnapshot label="Changed columns" value={pick(detail, ["changedColumns", "changed_columns", "columns"], null)} />
          </>}
        </aside>}
      </div>
    </section>
  );
};

export default GovernanceLogs;
