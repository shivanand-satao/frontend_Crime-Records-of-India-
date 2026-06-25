const Settings = () => (
  <section className="page-stack">
    <div className="page-heading">
      <div>
        <p className="eyebrow">Settings</p>
        <h2>API configuration</h2>
      </div>
    </div>
    <div className="panel profile-panel">
      <div><span>Base URL</span><strong>{import.meta.env.VITE_API_URL || "http://localhost:3000/api"}</strong></div>
      <div><span>Authentication</span><strong>JWT Bearer token</strong></div>
      <div><span>Cache-aware APIs</span><strong>Tables, schemas, analytics</strong></div>
    </div>
  </section>
);

export default Settings;
