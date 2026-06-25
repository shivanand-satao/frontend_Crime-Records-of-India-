import useAuth from "../../hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Account details</h2>
        </div>
      </div>
      <div className="panel profile-panel">
        <div><span>Username</span><strong>{user?.username || "-"}</strong></div>
        <div><span>Email</span><strong>{user?.email || "-"}</strong></div>
        <div><span>Role</span><strong>{user?.role || "user"}</strong></div>
      </div>
    </section>
  );
};

export default Profile;
