import { useEffect, useState } from "react";
import { FiDatabase, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import datasetService from "../../services/datasetService";

const Datasets = () => {
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    datasetService
      .getTables()
      .then((response) => setTables(response.tables || response.data || response || []))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const filteredTables = tables.filter((table) => String(table).toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Datasets</p>
          <h2>Explore backend tables</h2>
        </div>
        <label className="search-box">
          <FiSearch />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search datasets" />
        </label>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="dataset-grid compact">
        {filteredTables.map((table) => (
          <Link className="dataset-tile" to={`/dashboard/datasets/${table}`} key={table}>
            <FiDatabase />
            <span>{String(table).replaceAll("_", " ")}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Datasets;
