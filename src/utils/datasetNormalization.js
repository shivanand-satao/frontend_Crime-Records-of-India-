const candidateKeys = ["table_name", "tableName", "name", "Field", "column_name", "table", "id"];

export const extractTableName = (table) => {
  if (typeof table === "string") {
    return table;
  }

  if (table && typeof table === "object") {
    for (const key of candidateKeys) {
      if (table[key]) {
        return String(table[key]);
      }
    }
  }

  return String(table || "");
};

export const normalizeTableList = (response) => {
  const tables = response?.tables || response?.data || response || [];

  if (!Array.isArray(tables)) {
    return [];
  }

  return tables.map(extractTableName).filter(Boolean);
};

export const normalizeRowList = (response) => {
  const rows = response?.data || response?.rows || response?.records || response?.items || response?.result || response?.results || response?.payload || response || [];

  if (Array.isArray(rows)) {
    return rows;
  }

  if (rows && typeof rows === "object") {
    const nestedRows = rows.data || rows.rows || rows.records || rows.items || rows.result || rows.results || rows.payload;
    if (Array.isArray(nestedRows)) {
      return nestedRows;
    }

    const firstArrayValue = Object.values(rows).find(Array.isArray);
    if (Array.isArray(firstArrayValue)) {
      return firstArrayValue;
    }
  }

  return [];
};

export const normalizeSchemaList = (response) => {
  const schema = response?.schema || response?.columns || response?.data || response?.fields || response || [];

  if (Array.isArray(schema)) {
    return schema
      .map((column) => {
        if (typeof column === "string") {
          return column;
        }

        if (column && typeof column === "object") {
          return column.COLUMN_NAME || column.Field || column.name || column.column_name || column.columnName || column;
        }

        return column;
      })
      .filter(Boolean);
  }

  return [];
};