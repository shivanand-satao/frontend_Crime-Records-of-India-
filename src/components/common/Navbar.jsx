import { useState } from "react";
import { FiArrowRight, FiMenu, FiShield, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <header className="modern-header">
            <nav className="modern-nav" aria-label="Main navigation">
                <Link to="/" className="modern-brand" aria-label="Crime Records of India home"><span className="brand-symbol"><FiShield /></span><span>Crime Records<small>OF INDIA</small></span></Link>
                <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <FiX /> : <FiMenu />}</button>
                <div className={`modern-nav-links ${menuOpen ? "is-open" : ""}`} id="main-navigation" onClick={() => setMenuOpen(false)}>
                    <a href="#features">Platform</a><a href="#research-paths">Research paths</a><a href="#datasets">Datasets</a><a href="#research-assistant">AI assistant</a><Link className="nav-signin" to="/login">Sign in</Link><Link className="modern-button nav-cta" to="/register">Get started <FiArrowRight /></Link>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;