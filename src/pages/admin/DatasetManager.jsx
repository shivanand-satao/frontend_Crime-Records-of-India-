import { useEffect, useState } from "react";
import { FiSave, FiTrash2 } from "react-icons/fi";
import adminService from "../../services/adminService";
import datasetService from "../../services/datasetService";

const DatasetManager = () => {
  const [tables, setTables] = useState([]);
  const [table, setTable] = useState("");
  const [conditions, setConditions] = useState('{"Area_name":"Delhi","Year":2001}');
  const [newData, setNewData] = useState('{"Auto_Theft_Stolen":9999}');
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    datasetService.getTables().then((response) => {
      const nextTables = response.tables || response.data || response || [];
      setTables(nextTables);
      setTable(nextTables[0] || "");
    }).catch((requestError) => setError(requestError.message));
  }, []);

  const parseJson = (value) => JSON.parse(value || "{}");

  const runAction = async (action) => {
    setError("");
    setMessage("");

    try {
      const parsedConditions = parseJson(conditions);
      if (action === "update") {
        await adminService.updateRow(table, parsedConditions, parseJson(newData));
        setMessage("Dataset row update request completed.");
      } else {
        await adminService.deleteRows(table, parsedConditions);
        setMessage("Dataset delete request completed.");
      }
    } catch (requestError) {
      setError(requestError.message || "Request failed. Check the JSON payload.");
    }
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Governance</p>
          <h2>Dataset manager</h2>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {message && <div className="success-alert">{message}</div>}
      <div className="panel form-panel">
        <label>
          <span>Table</span>
          <select value={table} onChange={(event) => setTable(event.target.value)}>
            {tables.map((tableName) => <option value={tableName} key={tableName}>{String(tableName).replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label>
          <span>Conditions JSON</span>
          <textarea value={conditions} onChange={(event) => setConditions(event.target.value)} rows={5} />
        </label>
        <label>
          <span>New data JSON</span>
          <textarea value={newData} onChange={(event) => setNewData(event.target.value)} rows={5} />
        </label>
        <div className="button-row">
          <button className="primary-action" type="button" onClick={() => runAction("update")}><FiSave /> Update row</button>
          <button className="danger-action" type="button" onClick={() => runAction("delete")}><FiTrash2 /> Delete rows</button>
        </div>
      </div>
    </section>
  );
};

export default DatasetManager;
