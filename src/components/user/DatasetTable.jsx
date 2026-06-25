const prettify = (value) => String(value || "").replaceAll("_", " ");

const DatasetTable = ({ rows = [], schema = [], isLoading }) => {
  const columns =
    schema.length > 0
      ? schema.map((column) => column.Field || column.name || column.column_name || column)
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
              <th key={column}>{prettify(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column) => (
                <td key={column}>{row[column] ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DatasetTable;
