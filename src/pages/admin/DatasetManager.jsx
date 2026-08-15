import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiEdit3, FiRefreshCw, FiSave, FiTrash2, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import datasetService from "../../services/datasetService";
import { extractTableName, normalizeRowList, normalizeSchemaList, normalizeTableList } from "../../utils/datasetNormalization";

const PAGE_SIZE = 10;

const prettify = (value) => String(value || "").replaceAll("_", " ");

const getCellValue = (row, column) => {
  if (!row || typeof row !== "object") return "";
  if (column in row) return row[column];
  const target = String(column).toLowerCase().replace(/[\s_-]+/g, "");
  const key = Object.keys(row).find((candidate) => String(candidate).toLowerCase().replace(/[\s_-]+/g, "") === target);
  return key ? row[key] : "";
};

const formatCell = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const parseValue = (rawValue, currentValue) => {
  const trimmed = String(rawValue).trim();
  if (trimmed === "null") return null;
  if (typeof currentValue === "number" && trimmed !== "" && Number.isFinite(Number(trimmed))) return Number(trimmed);
  if (typeof currentValue === "boolean") return trimmed.toLowerCase() === "true";
  try {
    return JSON.parse(trimmed);
  } catch {
    return rawValue;
  }
};

const DatasetManager = () => {
  const [tables, setTables] = useState([]);
  const [table, setTable] = useState("");
  const [schema, setSchema] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);
  const [editColumn, setEditColumn] = useState("");
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [auditLogId, setAuditLogId] = useState("");

  const columns = useMemo(() => schema.length ? schema : Object.keys(rows[0] || {}), [rows, schema]);

  const loadRows = useCallback(async (nextPage) => {
    if (!table) return;
    setIsLoading(true);
    setError("");
    try {
      const [schemaResponse, rowsResponse] = await Promise.all([
        datasetService.getSchema(table),
        datasetService.getRows(table, { page: nextPage, limit: PAGE_SIZE }),
      ]);
      const nextRows = normalizeRowList(rowsResponse);
      const nextTotal = Number(rowsResponse?.totalRecords || rowsResponse?.total || nextRows.length);
      setSchema(normalizeSchemaList(schemaResponse));
      setRows(nextRows);
      setTotalRecords(nextTotal);
      setTotalPages(Math.max(1, Number(rowsResponse?.totalPages || Math.ceil(nextTotal / PAGE_SIZE) || 1)));
    } catch (requestError) {
      setError(requestError.message || "Unable to load the selected dataset.");
    } finally {
      setIsLoading(false);
    }
  }, [table]);

  useEffect(() => {
    datasetService.getTables().then((response) => {
      const nextTables = normalizeTableList(response);
      setTables(nextTables);
      setTable((current) => current || nextTables[0] || "");
    }).catch((requestError) => setError(requestError.message || "Unable to load datasets."));
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadRows(page));
  }, [loadRows, page]);

  const changeTable = (nextTable) => {
    setTable(extractTableName(nextTable));
    setPage(1);
    setSelectedRow(null);
    setPendingDeleteRow(null);
    setMessage("");
    setAuditLogId("");
  };

  const openEditor = (row, column = columns[0] || "") => {
    const value = getCellValue(row, column);
    setSelectedRow(row);
    setEditColumn(column);
    setEditValue(value === null || value === undefined ? "" : String(value));
    setError("");
    setMessage("");
    setAuditLogId("");
  };

  const changeEditColumn = (column) => {
    const value = getCellValue(selectedRow, column);
    setEditColumn(column);
    setEditValue(value === null || value === undefined ? "" : String(value));
  };

  const runUpdate = async (event) => {
    event.preventDefault();
    if (!table || !selectedRow || !editColumn) return;
    setIsMutating(true);
    setError("");
    setMessage("");
    try {
      const result = await adminService.updateRow(table, selectedRow, editColumn, parseValue(editValue, getCellValue(selectedRow, editColumn)));
      const nextAuditLogId = result?.auditLogId || result?.auditId || "";
      setAuditLogId(nextAuditLogId);
      setMessage(result?.changed === false ? "This cell already contains that value, so no audit record was created." : `Updated ${prettify(editColumn)} successfully.`);
      setSelectedRow(null);
      await loadRows(page);
    } catch (requestError) {
      setError(requestError.status === 409 ? "This row selector is not unique. Include more current row fields and try again." : requestError.message || "The row update failed.");
    } finally {
      setIsMutating(false);
    }
  };

  const runDelete = async () => {
    if (!table || !pendingDeleteRow) return;
    setIsMutating(true);
    setError("");
    setMessage("");
    try {
      const result = await adminService.deleteRow(table, pendingDeleteRow);
      setAuditLogId(result?.auditLogId || result?.auditId || "");
      setMessage("Row deleted successfully.");
      setSelectedRow(null);
      setPendingDeleteRow(null);
      await loadRows(page);
    } catch (requestError) {
      setError(requestError.status === 409 ? "This row selector is not unique. The row was not deleted." : requestError.message || "The row deletion failed.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Governance</p>
          <h2>Dataset manager</h2>
          <p className="subheading-text">Inspect live dataset rows and make one-cell, auditable changes.</p>
        </div>
        <button className="icon-button labeled" type="button" onClick={() => loadRows(page)} disabled={isLoading || !table}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      {error && <div className="alert">{error}</div>}
      {message && <div className="success-alert mutation-success"><span>{message}</span>{auditLogId && <Link to="/admin/governance">View audit record #{auditLogId}</Link>}</div>}
      <div className="panel dataset-toolbar">
        <label className="compact-field">
          <span>Dataset table</span>
          <select value={table} onChange={(event) => changeTable(event.target.value)}>
            {tables.map((tableName) => <option value={tableName} key={tableName}>{prettify(tableName)}</option>)}
          </select>
        </label>
        <div className="dataset-count"><strong>{totalRecords || rows.length}</strong><span>rows available</span></div>
      </div>
      {isLoading ? <div className="panel muted-panel">Loading dataset rows...</div> : !rows.length ? <div className="panel muted-panel">No records found for this dataset.</div> : (
        <div className="table-wrap">
          <table className="data-table admin-data-table">
            <thead><tr>{columns.map((column) => <th key={column}>{prettify(column)}</th>)}<th>Actions</th></tr></thead>
            <tbody>{rows.map((row, index) => <tr key={`${table}-${page}-${index}`}>
              {columns.map((column) => <td key={column}><button className="admin-cell-edit" type="button" onClick={() => openEditor(row, column)} title={`Edit ${prettify(column)}`}><span>{formatCell(getCellValue(row, column))}</span><FiEdit3 /></button></td>)}
              <td><div className="table-actions">
                <button className="icon-button labeled" type="button" onClick={() => openEditor(row)} disabled={isMutating}><FiEdit3 /> Edit</button>
                <button className="danger-action labeled" type="button" onClick={() => setPendingDeleteRow(row)} disabled={isMutating}><FiTrash2 /> Delete</button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
      <div className="pagination-row">
        <button className="icon-button labeled" type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}><FiChevronLeft /> Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button className="icon-button labeled" type="button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>Next <FiChevronRight /></button>
      </div>
      {selectedRow && <div className="modal-backdrop" role="presentation">
        <section className="modal-panel editor-modal" role="dialog" aria-modal="true" aria-labelledby="edit-cell-title">
          <div className="panel-heading"><div><p className="eyebrow">Single-cell update</p><h3 id="edit-cell-title">Edit selected cell</h3></div><button className="icon-button" type="button" onClick={() => setSelectedRow(null)} title="Close editor"><FiX /></button></div>
          <form className="form-panel" onSubmit={runUpdate}>
            <label><span>Column</span><select value={editColumn} onChange={(event) => changeEditColumn(event.target.value)}>{columns.map((column) => <option key={column} value={column}>{prettify(column)}</option>)}</select></label>
            <label><span>Current value</span><input value={formatCell(getCellValue(selectedRow, editColumn))} readOnly /></label>
            <label><span>New value</span><input autoFocus value={editValue} onChange={(event) => setEditValue(event.target.value)} /></label>
            <div className="button-row"><button className="primary-action" type="submit" disabled={isMutating}><FiSave /> {isMutating ? "Saving..." : "Save cell"}</button><button className="icon-button labeled" type="button" onClick={() => setSelectedRow(null)}><FiX /> Cancel</button></div>
          </form>
        </section>
      </div>}
      {pendingDeleteRow && <div className="modal-backdrop" role="presentation">
        <section className="modal-panel delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-row-title">
          <div className="panel-heading"><div><p className="eyebrow">Permanent action</p><h3 id="delete-row-title">Delete this row?</h3></div><button className="icon-button" type="button" onClick={() => setPendingDeleteRow(null)} title="Cancel deletion"><FiX /></button></div>
          <p className="muted-panel">Exactly one row will be deleted. The complete row will be preserved in the governance audit log.</p>
          <div className="delete-row-summary">{columns.slice(0, 3).map((column) => <div key={column}><span>{prettify(column)}</span><strong>{formatCell(getCellValue(pendingDeleteRow, column))}</strong></div>)}</div>
          <div className="button-row"><button className="danger-action" type="button" onClick={runDelete} disabled={isMutating}><FiTrash2 /> {isMutating ? "Deleting..." : "Delete row"}</button><button className="icon-button labeled" type="button" onClick={() => setPendingDeleteRow(null)}><FiX /> Cancel</button></div>
        </section>
      </div>}
    </section>
  );
};

export default DatasetManager;
