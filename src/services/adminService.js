import api from "./api";

const adminService = {
  updateRow(table, row, column, value) {
    return api.patch(`/admin/table/${encodeURIComponent(table)}/row`, {
      row,
      column,
      value,
    });
  },

  deleteRow(table, row) {
    return api.delete(`/admin/table/${encodeURIComponent(table)}/row`, { data: { row } });
  },

  getAuditLogs(params = {}) {
    return api.get("/admin/audit-logs", { params });
  },

  getAuditLog(id) {
    return api.get(`/admin/audit-logs/${encodeURIComponent(id)}`);
  },

  getUsers(params = {}) {
    return api.get("/admin/users", { params });
  },

  getSearchLogs(params = {}) {
    return api.get("/admin/search-logs", { params });
  },
};

export default adminService;
