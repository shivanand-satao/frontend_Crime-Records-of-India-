import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const UserNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.full_name || user?.username || "Research User";

  return (
    <header className="topbar">
      <div className="topbar-title">
        <p className="eyebrow">Explore</p>
        <h1>Compare crime data trends</h1>
        <p className="topbar-subtitle">Search across tables, spot patterns, and drill into records.</p>
      </div>
      <div className="topbar-actions">
        <span className="user-badge">{displayName}</span>
        <button className="icon-button labeled" onClick={handleLogout} title="Sign out">
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default UserNavbar;
