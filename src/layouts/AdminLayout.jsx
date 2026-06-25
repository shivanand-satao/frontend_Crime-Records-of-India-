import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="app-shell">
      <AdminSidebar />
      <div className="workspace">
        <AdminNavbar />
        <main className="workspace-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
