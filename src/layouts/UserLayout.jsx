import { Outlet } from "react-router-dom";
import UserNavbar from "../components/user/UserNavbar";
import UserSidebar from "../components/user/UserSidebar";

const UserLayout = () => {
  return (
    <div className="app-shell">
      <UserSidebar />
      <div className="workspace">
        <UserNavbar />
        <main className="workspace-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
