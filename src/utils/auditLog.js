export const getAuditId = (record) => {
  const keys = ["id", "auditLogId", "audit_log_id", "log_id"];
  const key = keys.find((candidate) => record?.[candidate] !== undefined && record?.[candidate] !== null && record?.[candidate] !== "");
  return key ? record[key] : "";
};
