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

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Crime Records Portal</p>
        <h1>{user?.full_name || user?.username || "Research User"}</h1>
      </div>
      <button className="icon-button labeled" onClick={handleLogout} title="Sign out">
        <FiLogOut />
        <span>Logout</span>
      </button>
    </header>
  );
};

export default UserNavbar;
