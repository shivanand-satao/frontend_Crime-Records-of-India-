import api from "./api";

const datasetService = {
  getTables() {
    return api.get("/tables");
  },

  getSchema(table) {
    return api.get(`/tables/${encodeURIComponent(table)}/schema`);
  },

  getRows(table, params = {}) {
    return api.get(`/data/${encodeURIComponent(table)}`, { params });
  },

  searchRows(table, params = {}) {
    return api.post(`/data/${encodeURIComponent(table)}/search`, params);
  },

  getFilterOptions(table, column) {
    return api.get(`/data/${encodeURIComponent(table)}/filter-options/${encodeURIComponent(column)}`);
  },
};

export default datasetService;
