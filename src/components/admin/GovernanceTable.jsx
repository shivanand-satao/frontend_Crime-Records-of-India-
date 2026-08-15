import { FiEye } from "react-icons/fi";
import { formatDateTime } from "../../utils/formatDate";
import { getAuditId } from "../../utils/auditLog";

const pick = (record, keys, fallback = "-") => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== "") return record[key];
  }
  return fallback;
};

const formatChangedColumns = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return Object.keys(value).join(", ");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(", ") : Object.keys(parsed).join(", ");
    } catch {
      return value;
    }
  }
  return "-";
};

const GovernanceTable = ({ logs = [], isLoading, selectedId, onSelect }) => {
  if (isLoading) return <div className="panel muted-panel">Loading audit records...</div>;
  if (!logs.length) return <div className="panel muted-panel">No audit records match these filters.</div>;

  return (
    <div className="table-wrap">
      <table className="data-table governance-table">
        <thead><tr><th>Action</th><th>Dataset</th><th>Administrator</th><th>Changed columns</th><th>Created</th><th>Details</th></tr></thead>
        <tbody>{logs.map((record, index) => {
          const id = getAuditId(record);
          const action = String(pick(record, ["action", "action_type", "type"], "Unknown")).toUpperCase();
          return <tr key={id || index} className={String(selectedId) === String(id) ? "selected-row" : ""}>
            <td><span className={`status-badge status-${action.toLowerCase()}`}>{action}</span></td>
            <td>{String(pick(record, ["tableName", "table_name", "table"])).replaceAll("_", " ")}</td>
            <td>{pick(record, ["adminUsername", "admin_username", "username", "admin_name"], `Admin #${pick(record, ["adminId", "admin_id"], "-")}`)}</td>
            <td>{formatChangedColumns(pick(record, ["changedColumns", "changed_columns", "columns"], "-"))}</td>
            <td>{formatDateTime(pick(record, ["createdAt", "created_at", "timestamp"], "")) || "-"}</td>
            <td><button className="icon-button" type="button" onClick={() => onSelect?.(record)} title="View audit details"><FiEye /></button></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  );
};

export default GovernanceTable;
