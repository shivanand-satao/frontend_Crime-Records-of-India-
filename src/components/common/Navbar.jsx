import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">
                Crime Records of India
            </div>

            <div className="nav-links">
                <a href="#features">Features</a>
                <a href="#datasets">Datasets</a>
                <a href="#analytics">Analytics</a>

                <Link to="/login">
                    <button className="login-btn">
                        Login
                    </button>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;