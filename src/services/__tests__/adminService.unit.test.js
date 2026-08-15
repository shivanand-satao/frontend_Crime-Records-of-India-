import MockAdapter from "axios-mock-adapter";
import api from "../api";
import adminService from "../adminService";
import datasetService from "../datasetService";

describe("Admin governance service contract", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
    localStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    mock.restore();
  });

  test("updates one selected cell with PATCH", async () => {
    const row = { Area_name: "Delhi", Year: 2001 };
    mock.onPatch("/admin/table/auto_theft/row").reply((config) => {
      expect(JSON.parse(config.data)).toEqual({ row, column: "Auto_Theft_Stolen", value: 9999 });
      return [200, { auditLogId: 14 }];
    });

    await expect(adminService.updateRow("auto_theft", row, "Auto_Theft_Stolen", 9999)).resolves.toEqual({ auditLogId: 14 });
  });

  test("deletes exactly one selected row", async () => {
    const row = { Area_name: "Delhi", Year: 2001 };
    mock.onDelete("/admin/table/auto_theft/row").reply((config) => {
      expect(JSON.parse(config.data)).toEqual({ row });
      return [200, { auditLogId: 15 }];
    });

    await expect(adminService.deleteRow("auto_theft", row)).resolves.toEqual({ auditLogId: 15 });
  });

  test("loads paginated audit logs and one audit detail", async () => {
    const params = { page: 2, limit: 20, action: "UPDATE" };
    mock.onGet("/admin/audit-logs", { params }).reply(200, { logs: [] });
    mock.onGet("/admin/audit-logs/42").reply(200, { id: 42 });

    await expect(adminService.getAuditLogs(params)).resolves.toEqual({ logs: [] });
    await expect(adminService.getAuditLog(42)).resolves.toEqual({ id: 42 });
  });

  test("uses POST for the documented dataset search endpoint", async () => {
    const request = { filters: { Area_name: "Delhi" }, page: 1, limit: 20 };
    mock.onPost("/data/auto_theft/search").reply((config) => {
      expect(JSON.parse(config.data)).toEqual(request);
      return [200, { rows: [] }];
    });

    await expect(datasetService.searchRows("auto_theft", request)).resolves.toEqual({ rows: [] });
  });
});
