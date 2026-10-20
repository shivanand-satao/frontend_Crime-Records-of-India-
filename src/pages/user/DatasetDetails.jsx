import { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";
import DatasetTable from "../../components/user/DatasetTable";
import { recordActivity } from "../../utils/activityLog";
import datasetService from "../../services/datasetService";
import { normalizeRowList, normalizeSchemaList } from "../../utils/datasetNormalization";

const DatasetDetails = () => {
  const { tableName: rawTableName } = useParams();
  const tableName = decodeURIComponent(rawTableName || "");
  const [schema, setSchema] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [columnFilter, setColumnFilter] = useState({ column: "", value: "" });
  const [activeDropdownColumn, setActiveDropdownColumn] = useState("");
  const [columnOptions, setColumnOptions] = useState({});
  const [loadingColumnOptions, setLoadingColumnOptions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const applyQuery = useCallback((nextQuery) => {
    const nextValue = String(nextQuery || "");
    setSearchInput(nextValue);
    setQuery(nextValue);
    setColumnFilter({ column: "", value: "" });
    setPage(1);
  }, []);

  const openColumnDropdown = useCallback(async (column) => {
    const columnName = String(column || "");

    if (!columnName) {
      return;
    }

    setActiveDropdownColumn((current) => (current === columnName ? "" : columnName));

    if (columnOptions[columnName]) {
      return;
    }

    setLoadingColumnOptions(columnName);

    try {
      const response = await datasetService.getFilterOptions(tableName, columnName);
      const options = response.data || response.options || response.values || [];
      setColumnOptions((current) => ({
        ...current,
        [columnName]: Array.isArray(options) ? options : [],
      }));
    } catch (requestError) {
      setError(requestError.message || `Failed to load values for ${columnName}`);
    } finally {
      setLoadingColumnOptions("");
    }
  }, [columnOptions, tableName]);

  const applyColumnFilter = useCallback((column, value) => {
    const columnName = String(column || "");
    const nextValue = value === null || value === undefined ? "" : String(value);
    setColumnFilter({ column: columnName, value: nextValue });
    setSearchInput(nextValue);
    setQuery("");
    setPage(1);
    setActiveDropdownColumn("");
  }, []);

  const clearColumnFilter = useCallback(() => {
    setColumnFilter({ column: "", value: "" });
    setSearchInput("");
    setQuery("");
    setPage(1);
    setActiveDropdownColumn("");
  }, []);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const normalizedQuery = String(query || "").trim();
      const normalizedColumnValue = String(columnFilter.value || "").trim();
      const currentPage = Number(page || 1);
      let response;

      if (normalizedColumnValue) {
        response = await datasetService.searchRows(tableName, {
          filters: { [columnFilter.column]: normalizedColumnValue },
          page: currentPage,
          limit: 10,
        });
      } else if (normalizedQuery) {
        response = await datasetService.searchRows(tableName, {
          searchTerm: normalizedQuery,
          page: currentPage,
          limit: 10,
        });
      } else {
        response = await datasetService.getRows(tableName, { page: currentPage, limit: 10 });
      }

      const nextRows = normalizeRowList(response);
      setRows(nextRows);
      setTotalRecords(Number(response.totalRecords || nextRows.length));
      setTotalPages(Number(response.totalPages || 1));

      recordActivity({
        type: "dataset-view",
        title: `${tableName.replaceAll("_", " ")}`,
        subtitle: normalizedColumnValue
          ? `${columnFilter.column.replaceAll("_", " ")} = ${normalizedColumnValue}`
          : normalizedQuery
            ? `Search: ${normalizedQuery}`
            : `Page ${currentPage}`,
        table: tableName,
        page: currentPage,
        query: normalizedQuery,
        columnFilter,
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to load dataset rows.");
    } finally {
      setIsLoading(false);
    }
  }, [columnFilter, page, query, tableName]);

  useEffect(() => {
    datasetService
      .getSchema(tableName)
      .then((response) => setSchema(normalizeSchemaList(response)))
      .catch(() => setSchema([]));
  }, [tableName]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRows();
  }, [loadRows]);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Dataset</p>
          <h2>{tableName.replaceAll("_", " ")}</h2>
          {query && <p className="active-filter">Filtering by: {query}</p>}
          {columnFilter.value && (
            <p className="active-filter">
              {columnFilter.column.replaceAll("_", " ")} = {columnFilter.value}
              <button type="button" className="filter-clear-button" onClick={clearColumnFilter} aria-label="Clear column filter">
                <FiX />
              </button>
            </p>
          )}
          {query && <p className="active-filter">{totalRecords} matching row{totalRecords === 1 ? "" : "s"} found</p>}
        </div>
        <form className="search-box" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(searchInput.trim()); setColumnFilter({ column: "", value: "" }); }}>
          <FiSearch />
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search records" />
        </form>
      </div>
      {error && <div className="alert">{error}</div>}
      <DatasetTable
        rows={rows}
        schema={schema}
        isLoading={isLoading}
        onCellClick={applyQuery}
        onHeaderClick={openColumnDropdown}
        activeDropdownColumn={activeDropdownColumn}
        columnOptions={columnOptions}
        loadingColumnOptions={loadingColumnOptions}
        onOptionSelect={applyColumnFilter}
      />
      <div className="pagination-row">
        <button className="icon-button labeled" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          <FiChevronLeft /> Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button className="icon-button labeled" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
          Next <FiChevronRight />
        </button>
      </div>
    </section>
  );
};

export default DatasetDetails;
