import { FiArrowUpRight, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => (
    <footer className="modern-footer">
        <div className="modern-footer-top"><div className="footer-brand-copy"><Link to="/" className="modern-brand"><span className="brand-symbol"><FiShield /></span><span>Crime Records<small>OF INDIA</small></span></Link><p>A clearer perspective on crime data.<br />Built for exploration. Designed for understanding.</p><span className="footer-purpose">A data platform. Not an emergency service.</span></div><div><h3>Explore</h3><a href="#datasets">Dataset collection</a><a href="#features">The platform</a><a href="#how-it-works">How it works</a></div><div><h3>Your workspace</h3><Link to="/dashboard">Overview <FiArrowUpRight /></Link><Link to="/dashboard/analytics">Analytics</Link><Link to="/dashboard/history">Activity history</Link></div><div><h3>Get started</h3><Link to="/register">Create an account</Link><Link to="/login">Sign in</Link><Link to="/admin">Admin portal</Link></div></div>
        <div className="modern-footer-bottom"><p>© {new Date().getFullYear()} Crime Records of India</p><p>Developed by Shivanand Satao <span>·</span> Explore responsibly.</p></div>
    </footer>
);

export default Footer;