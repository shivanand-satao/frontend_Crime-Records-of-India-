import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Administrative Console</p>
        <h1>{user?.username || "Super Admin"}</h1>
      </div>
      <button className="icon-button labeled" onClick={handleLogout} title="Sign out">
        <FiLogOut />
        <span>Logout</span>
      </button>
    </header>
  );
};

export default AdminNavbar;
