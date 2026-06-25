import api from "./api";

const datasetService = {
  getTables() {
    return api.get("/tables");
  },

  getSchema(table) {
    return api.get(`/tables/${table}/schema`);
  },

  getRows(table, params = {}) {
    return api.get(`/data/${table}`, { params });
  },

  searchRows(table, params = {}) {
    return api.get(`/data/${table}/search`, { params });
  },

  getFilterOptions(table, column) {
    return api.get(`/data/${table}/filter-options/${column}`);
  },
};

export default datasetService;
