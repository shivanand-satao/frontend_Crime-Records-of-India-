import { useEffect, useState } from "react";
import { FiArrowRight, FiDatabase, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import datasetService from "../../services/datasetService";
import { extractTableName, normalizeTableList } from "../../utils/datasetNormalization";

const Datasets = () => {
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    datasetService
      .getTables()
      .then((response) => setTables(normalizeTableList(response)))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const filteredTables = tables.filter((table) => String(table).toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="page-stack">
      <div className="page-heading dashboard-subhead">
        <div>
          <p className="eyebrow">Datasets</p>
          <h2>Search the available tables</h2>
          <p className="subheading-text">Filter the records you want to compare and open the detailed table view from here.</p>
        </div>
        <label className="search-box">
          <FiSearch />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search datasets" />
        </label>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="panel dataset-hero-row">
        <div>
          <p className="eyebrow">Filtered result</p>
          <h3>{filteredTables.length} dataset{filteredTables.length === 1 ? "" : "s"} visible</h3>
        </div>
        <Link className="secondary-link" to="/dashboard/analytics">
          Review trend summary
          <FiArrowRight />
        </Link>
      </div>
      <div className="dataset-grid compact">
        {filteredTables.length > 0 ? (
          filteredTables.map((table) => (
            <Link className="dataset-tile" to={`/dashboard/datasets/${extractTableName(table)}`} key={table}>
              <FiDatabase />
              <span>{String(table).replaceAll("_", " ")}</span>
            </Link>
          ))
        ) : (
          <div className="panel empty-state">No datasets match the current search.</div>
        )}
      </div>
    </section>
  );
};

export default Datasets;
