import { FiBarChart2, FiClock, FiDatabase, FiHome, FiUser } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Overview", icon: FiHome, end: true },
  { to: "/dashboard/datasets", label: "Datasets", icon: FiDatabase },
  { to: "/dashboard/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/dashboard/history", label: "History", icon: FiClock },
  { to: "/dashboard/profile", label: "Profile", icon: FiUser },
];

const UserSidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-brand">CRI</div>
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

export default UserSidebar;
