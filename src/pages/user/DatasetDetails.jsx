import { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { useParams } from "react-router-dom";
import DatasetTable from "../../components/user/DatasetTable";
import datasetService from "../../services/datasetService";

const DatasetDetails = () => {
  const { tableName } = useParams();
  const [schema, setSchema] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = { page, limit: 10 };
      const response = query
        ? await datasetService.searchRows(tableName, { ...params, q: query, search: query })
        : await datasetService.getRows(tableName, params);

      setRows(response.data || response.rows || response.records || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, query, tableName]);

  useEffect(() => {
    datasetService
      .getSchema(tableName)
      .then((response) => setSchema(response.schema || response.columns || response.data || []))
      .catch(() => setSchema([]));
  }, [tableName]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Dataset</p>
          <h2>{tableName.replaceAll("_", " ")}</h2>
        </div>
        <form className="search-box" onSubmit={(event) => { event.preventDefault(); setPage(1); loadRows(); }}>
          <FiSearch />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" />
        </form>
      </div>
      {error && <div className="alert">{error}</div>}
      <DatasetTable rows={rows} schema={schema} isLoading={isLoading} />
      <div className="pagination-row">
        <button className="icon-button labeled" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          <FiChevronLeft /> Previous
        </button>
        <span>Page {page}</span>
        <button className="icon-button labeled" onClick={() => setPage((current) => current + 1)}>
          Next <FiChevronRight />
        </button>
      </div>
    </section>
  );
};

export default DatasetDetails;
