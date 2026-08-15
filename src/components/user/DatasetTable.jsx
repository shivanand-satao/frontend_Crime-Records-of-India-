import { FiChevronDown } from "react-icons/fi";

const prettify = (value) => String(value || "").replaceAll("_", " ");

const normalizeKey = (value) => String(value || "").toLowerCase().replace(/[\s_-]+/g, "");

const resolveCellValue = (row, column) => {
  if (row == null) {
    return "-";
  }

  if (Array.isArray(row)) {
    return row[column] ?? "-";
  }

  if (typeof row !== "object") {
    return row;
  }

  if (column in row) {
    return row[column] ?? "-";
  }

  const matchedKey = Object.keys(row).find((key) => normalizeKey(key) === normalizeKey(column));
  return matchedKey ? row[matchedKey] ?? "-" : "-";
};

const DatasetTable = ({
  rows = [],
  schema = [],
  isLoading,
  onCellClick,
  onHeaderClick,
  activeDropdownColumn = "",
  columnOptions = {},
  loadingColumnOptions = "",
  onOptionSelect,
}) => {
  const columns =
    schema.length > 0
      ? schema.map((column) => (typeof column === "string" ? column : column.Field || column.name || column.column_name || column.COLUMN_NAME || column))
      : Object.keys(rows[0] || {});

  if (isLoading) {
    return <div className="panel muted-panel">Loading records...</div>;
  }

  if (!rows.length) {
    return <div className="panel muted-panel">No records found for this view.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="dataset-header-cell">
                <button
                  type="button"
                  className="dataset-header-button"
                  onClick={() => onHeaderClick?.(column)}
                  title={`Filter by ${prettify(column)}`}
                >
                  <span>{prettify(column)}</span>
                  <FiChevronDown />
                </button>
                {activeDropdownColumn === column && (
                  <div className="dataset-dropdown">
                    {loadingColumnOptions === column ? (
                      <div className="dataset-dropdown-empty">Loading values...</div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="dataset-dropdown-item dataset-dropdown-clear"
                          onClick={() => onOptionSelect?.(column, "")}
                        >
                          Show all values
                        </button>
                        {(columnOptions[column] || []).length > 0 ? (
                          columnOptions[column].map((option) => (
                            <button
                              type="button"
                              className="dataset-dropdown-item"
                              key={`${column}-${option}`}
                              onClick={() => onOptionSelect?.(column, option)}
                            >
                              {String(option)}
                            </button>
                          ))
                        ) : (
                          <div className="dataset-dropdown-empty">No values available</div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column) => (
                <td key={column}>
                  {(() => {
                    const cellValue = resolveCellValue(row, column);
                    const canFilter = typeof cellValue !== "string" || cellValue.trim() !== "-";

                    if (!onCellClick || !canFilter) {
                      return cellValue;
                    }

                    return (
                      <button
                        type="button"
                        className="dataset-cell-button"
                        onClick={() => onCellClick(cellValue)}
                        title={`Filter by ${cellValue}`}
                      >
                        {cellValue}
                      </button>
                    );
                  })()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DatasetTable;
