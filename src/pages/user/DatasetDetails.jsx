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
  const [columnFilters, setColumnFilters] = useState({});
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
    setColumnFilters({});
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

    if (!columnName) {
      return;
    }

    const hasValue = value !== null && value !== undefined && String(value).trim() !== "";

    setColumnFilters((current) => {
      const nextFilters = { ...current };

      if (hasValue) {
        nextFilters[columnName] = typeof value === "string" ? value.trim() : value;
      } else {
        delete nextFilters[columnName];
      }

      return nextFilters;
    });
    setSearchInput("");
    setQuery("");
    setPage(1);
    setActiveDropdownColumn("");
  }, []);

  const clearColumnFilter = useCallback((columnName = "") => {
    setColumnFilters((current) => {
      if (!columnName) {
        return {};
      }

      const nextFilters = { ...current };
      delete nextFilters[columnName];
      return nextFilters;
    });
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
      const filters = Object.entries(columnFilters).reduce((result, [column, value]) => {
        const normalizedValue = value === null || value === undefined
          ? ""
          : String(value).trim();

        if (normalizedValue) {
          result[column] = typeof value === "string" ? normalizedValue : value;
        }

        return result;
      }, {});
      const currentPage = Number(page || 1);
      const hasFilters = Object.keys(filters).length > 0;
      let response;

      if (hasFilters || normalizedQuery) {
        response = await datasetService.searchRows(tableName, {
          filters,
          ...(normalizedQuery ? { searchTerm: normalizedQuery } : {}),
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

      const filterSummary = Object.entries(filters)
        .map(([column, value]) => `${column.replaceAll("_", " ")} = ${value}`)
        .join(", ");

      recordActivity({
        type: "dataset-view",
        title: `${tableName.replaceAll("_", " ")}`,
        subtitle: filterSummary
          ? filterSummary
          : normalizedQuery
            ? `Search: ${normalizedQuery}`
            : `Page ${currentPage}`,
        table: tableName,
        page: currentPage,
        query: normalizedQuery,
        columnFilters: filters,
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to load dataset rows.");
    } finally {
      setIsLoading(false);
    }
  }, [columnFilters, page, query, tableName]);

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
          {Object.entries(columnFilters).map(([column, value]) => (
            <p className="active-filter" key={column}>
              {column.replaceAll("_", " ")} = {String(value)}
              <button type="button" className="filter-clear-button" onClick={() => clearColumnFilter(column)} aria-label={`Clear ${column} filter`}>
                <FiX />
              </button>
            </p>
          ))}
          {Object.keys(columnFilters).length > 1 && (
            <button type="button" className="filter-clear-button" onClick={() => clearColumnFilter()} aria-label="Clear all filters">
              Clear all filters
            </button>
          )}
          {(query || Object.keys(columnFilters).length > 0) && (
            <p className="active-filter">{totalRecords} matching row{totalRecords === 1 ? "" : "s"} found</p>
          )}
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
