import { useCallback, useEffect, useRef, useState } from "react";
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
  const globalFilterCache = useRef({ tableName: "", query: "", rows: [] });
  const columnFilterRef = useRef({ column: "", value: "" });
  const queryRef = useRef("");

  useEffect(() => {
    columnFilterRef.current = columnFilter;
  }, [columnFilter]);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

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
    const nextValue = String(value || "");
    columnFilterRef.current = { column: columnName, value: nextValue };
    setColumnFilter({ column: columnName, value: nextValue });
    setSearchInput(nextValue);
    setQuery("");
    setPage(1);
    setActiveDropdownColumn("");
    loadRows({ columnFilterOverride: { column: columnName, value: nextValue }, queryOverride: "", pageOverride: 1 });
  }, []);

  const clearColumnFilter = useCallback(() => {
    columnFilterRef.current = { column: "", value: "" };
    setColumnFilter({ column: "", value: "" });
    setSearchInput("");
    setQuery("");
    setPage(1);
    setActiveDropdownColumn("");
    loadRows({ columnFilterOverride: { column: "", value: "" }, queryOverride: "", pageOverride: 1 });
  }, []);

  const rowMatchesQuery = useCallback((row, searchTerm) => {
    const normalizedTerm = String(searchTerm || "").trim().toLowerCase();

    if (!normalizedTerm) {
      return true;
    }

    return Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(normalizedTerm));
  }, []);

  const rowMatchesColumnFilter = useCallback((row, filter) => {
    const columnName = String(filter?.column || "").trim();
    const filterValue = String(filter?.value || "").trim().toLowerCase();

    if (!columnName || !filterValue) {
      return true;
    }

    const rowValue = row?.[columnName] ?? row?.[columnName.replace(/\s+/g, "_")];
    if (rowValue != null && String(rowValue).toLowerCase() === filterValue) {
      return true;
    }

    return Object.entries(row || {}).some(([key, value]) => {
      const normalizedKey = String(key || "").toLowerCase().replace(/[\s_-]+/g, "");
      const normalizedColumn = columnName.toLowerCase().replace(/[\s_-]+/g, "");

      return normalizedKey === normalizedColumn && String(value ?? "").toLowerCase().includes(filterValue);
    });
  }, []);

  const loadRows = useCallback(async (overrides = {}) => {
    setIsLoading(true);
    setError("");

    try {
      const currentColumnFilter = overrides.columnFilterOverride || columnFilterRef.current;
      const normalizedQuery = String(overrides.queryOverride ?? queryRef.current ?? "").trim();
      const currentPage = Number(overrides.pageOverride ?? page ?? 1);
      const normalizedColumnValue = String(currentColumnFilter.value || "").trim();

      if (normalizedColumnValue) {
        const cache = globalFilterCache.current;
        const cacheKey = `${tableName}:${String(currentColumnFilter.column).toLowerCase()}:${normalizedColumnValue.toLowerCase()}`;
        const cacheHit = cache.tableName === cacheKey;

        if (!cacheHit) {
          const firstResponse = await datasetService.getRows(tableName, { page: 1, limit: 100 });
          const totalPagesFromServer = Number(firstResponse.totalPages || 1);
          const firstPageRows = normalizeRowList(firstResponse);
          const additionalResponses = totalPagesFromServer > 1
            ? await Promise.all(
                Array.from({ length: totalPagesFromServer - 1 }, (_, index) =>
                  datasetService.getRows(tableName, { page: index + 2, limit: 100 })
                )
              )
            : [];

          const allRows = [
            ...firstPageRows,
            ...additionalResponses.flatMap((response) => normalizeRowList(response)),
          ];

          cache.tableName = cacheKey;
          cache.query = normalizedColumnValue.toLowerCase();
          cache.rows = allRows.filter((row) => rowMatchesColumnFilter(row, currentColumnFilter));
        }

        const matchingRows = globalFilterCache.current.rows;
        const startIndex = (currentPage - 1) * 10;
        setTotalRecords(matchingRows.length);
        setTotalPages(Math.max(1, Math.ceil(matchingRows.length / 10)));
        setRows(matchingRows.slice(startIndex, startIndex + 10));
      } else if (normalizedQuery) {
        const cache = globalFilterCache.current;
        const cacheHit = cache.tableName === tableName && cache.query === normalizedQuery.toLowerCase();

        if (!cacheHit) {
          const firstResponse = await datasetService.getRows(tableName, { page: 1, limit: 100 });
          const totalPagesFromServer = Number(firstResponse.totalPages || 1);
          const firstPageRows = normalizeRowList(firstResponse);
          const additionalResponses = totalPagesFromServer > 1
            ? await Promise.all(
                Array.from({ length: totalPagesFromServer - 1 }, (_, index) =>
                  datasetService.getRows(tableName, { page: index + 2, limit: 100 })
                )
              )
            : [];

          const allRows = [
            ...firstPageRows,
            ...additionalResponses.flatMap((response) => normalizeRowList(response)),
          ];

          cache.tableName = tableName;
          cache.query = normalizedQuery.toLowerCase();
          cache.rows = allRows.filter((row) => rowMatchesQuery(row, normalizedQuery));
        }

        const matchingRows = globalFilterCache.current.rows;
        const startIndex = (currentPage - 1) * 10;
        setTotalRecords(matchingRows.length);
        setTotalPages(Math.max(1, Math.ceil(matchingRows.length / 10)));
        setRows(matchingRows.slice(startIndex, startIndex + 10));
      } else {
        globalFilterCache.current = { tableName: "", query: "", rows: [] };
        const response = await datasetService.getRows(tableName, { page: currentPage, limit: 10 });
        const nextRows = normalizeRowList(response);
        setRows(nextRows);
        setTotalRecords(Number(response.totalRecords || nextRows.length));
        setTotalPages(Number(response.totalPages || 1));
      }

      recordActivity({
        type: "dataset-view",
        title: `${tableName.replaceAll("_", " ")}`,
        subtitle: currentColumnFilter.value
          ? `${currentColumnFilter.column.replaceAll("_", " ")} = ${currentColumnFilter.value}`
          : normalizedQuery
            ? `Search: ${normalizedQuery}`
            : `Page ${currentPage}`,
        table: tableName,
        page: currentPage,
        query: normalizedQuery,
        columnFilter: currentColumnFilter,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowMatchesColumnFilter, rowMatchesQuery, tableName]);

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
        <form className="search-box" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(searchInput.trim()); }}>
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
