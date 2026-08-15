const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const isAdminRole = (role) => ADMIN_ROLES.has(normalizeRole(role));

export const getHomePath = (role) => (isAdminRole(role) ? "/admin" : "/dashboard");

export const getPostLoginPath = (role, fromPath) => {
	const normalizedFromPath = typeof fromPath === "string" ? fromPath : "";

	if (normalizedFromPath.startsWith("/admin")) {
		return isAdminRole(role) ? normalizedFromPath : "/dashboard";
	}

	if (normalizedFromPath.startsWith("/dashboard")) {
		return isAdminRole(role) ? "/admin" : normalizedFromPath;
	}

	return getHomePath(role);
};
