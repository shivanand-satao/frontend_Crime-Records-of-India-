import { FiActivity, FiDatabase, FiHome, FiSearch, FiSettings, FiUsers } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Overview", icon: FiHome, end: true },
  { to: "/admin/datasets", label: "Datasets", icon: FiDatabase },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/search-logs", label: "Search Logs", icon: FiSearch },
  { to: "/admin/governance", label: "Governance", icon: FiActivity },
  { to: "/admin/settings", label: "Settings", icon: FiSettings },
];

const AdminSidebar = () => (
  <aside className="sidebar admin-sidebar">
    <div className="sidebar-brand">Admin</div>
    <nav className="sidebar-links">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="sidebar-link">
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;
