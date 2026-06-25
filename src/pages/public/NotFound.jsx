import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="screen-message">
    <h1>Page not found</h1>
    <Link to="/">Return home</Link>
  </main>
);

export default NotFound;
