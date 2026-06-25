import api from "./api";

const adminService = {
  updateRow(table, conditions, newData) {
    return api.put(`/admin/table/${table}/update`, { conditions, newData });
  },

  deleteRows(table, conditions) {
    return api.delete(`/admin/table/${table}/delete`, { data: { conditions } });
  },
};

export default adminService;
